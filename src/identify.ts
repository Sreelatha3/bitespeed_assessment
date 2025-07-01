import { Request, Response } from 'express';
import { PrismaClient, LinkPrecedence } from '@prisma/client';

const prisma = new PrismaClient();

export const identifyContact = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  // Validate input
  if (!email && !phoneNumber) {
    return res.status(400).json({ message: 'Please provide email or phoneNumber' });
  }

  try {
    // Step 1: Find contacts that match either email or phoneNumber
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { email: email ?? undefined },
          { phoneNumber: phoneNumber ?? undefined }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    // Step 2: If no contacts found, create a new primary contact
    if (contacts.length === 0) {
      const newPrimary = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: LinkPrecedence.PRIMARY
        }
      });

      return res.status(200).json({
        contact: {
          primaryContatctId: newPrimary.id,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: []
        }
      });
    }

    // Step 3: Find the oldest primary contact among found contacts
    const primary = contacts.find(c => c.linkPrecedence === LinkPrecedence.PRIMARY) || contacts[0];

    // Step 4: Check if the new info (email/phone) already exists in these contacts
    const emailExists = contacts.some(c => c.email === email);
    const phoneExists = contacts.some(c => c.phoneNumber === phoneNumber);

    // Step 5: If there is new info, create a secondary contact linked to primary
    if ((!emailExists && email) || (!phoneExists && phoneNumber)) {
      await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: LinkPrecedence.SECONDARY,
          linkedId: primary.id
        }
      });
    }

    // Step 6: Fetch all contacts linked to this primary contact (including primary)
    const relatedContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { id: primary.id },
          { linkedId: primary.id }
        ]
      }
    });

    // Step 7: Consolidate emails, phones and secondary IDs
    const emails = Array.from(new Set(relatedContacts.map(c => c.email).filter(Boolean)));
    const phoneNumbers = Array.from(new Set(relatedContacts.map(c => c.phoneNumber).filter(Boolean)));
    const secondaryContactIds = relatedContacts
      .filter(c => c.linkPrecedence === LinkPrecedence.SECONDARY)
      .map(c => c.id);

    // Step 8: Send consolidated response
    return res.status(200).json({
      contact: {
        primaryContatctId: primary.id,
        emails,
        phoneNumbers,
        secondaryContactIds
      }
    });

  } catch (error) {
    console.error('Error processing identify request:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

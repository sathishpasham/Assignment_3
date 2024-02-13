// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const { connectdb } = require("./database");
const Contact = require("./Contact");

// Create Express app
const app = express();
const PORT = process.env.PORT || 3007;

connectdb();

// Middleware
app.use(bodyParser.json());

app.post("/identify", async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    // to checkif exsisting contact ius there or not
    const existingContacts = await Contact.find({
      $or: [{ email }, { phoneNumber }],
    });

    let primaryContactId;
    let emails = [];
    let phoneNumbers = [];
    let secondaryContactIds = [];

    if (existingContacts.length > 0) {
      // Find the primary contact with the provided email or phone number
      const primaryContact = existingContacts.find(
        (contact) => contact.linkPrecedence === "primary"
      );

      if (primaryContact) {
        // Primary contact found, update it and create a new secondary contact
        primaryContactId = primaryContact._id;
        emails = existingContacts.map((contact) => contact.email);
        phoneNumbers = existingContacts.map((contact) => contact.phoneNumber);
        secondaryContactIds = existingContacts
          .filter((contact) => contact.linkPrecedence === "secondary")
          .map((contact) => contact._id);

        // Create a new secondary contact linked to the primary contact
        const newSecondaryContact = new Contact({
          email,
          phoneNumber,
          linkedId: primaryContactId,
          linkPrecedence: "secondary",
        });
        const savedSecondaryContact = await newSecondaryContact.save();
        secondaryContactIds.push(savedSecondaryContact._id);
      } else {
        // No primary contact found, create a new primary contact
        const newContact = new Contact({
          email,
          phoneNumber,
          linkPrecedence: "primary",
        });
        const savedContact = await newContact.save();
        primaryContactId = savedContact._id;
        emails.push(email);
        phoneNumbers.push(phoneNumber);
      }
    } else {
      // No existing contacts found, create a new primary contact
      const newContact = new Contact({
        email,
        phoneNumber,
        linkPrecedence: "primary",
      });
      const savedContact = await newContact.save();
      primaryContactId = savedContact._id;
      emails.push(email);
      phoneNumbers.push(phoneNumber);
    }

    // Return the consolidated contact information
    res.status(200).json({
      contact: {
        primaryContactId,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    });
  } catch (err) {
    console.error("Error identifying contact:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

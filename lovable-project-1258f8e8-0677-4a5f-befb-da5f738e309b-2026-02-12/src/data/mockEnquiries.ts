import { Enquiry } from "@/types/enquiry";

export const mockEnquiries: Enquiry[] = [
  {
    id: "1",
    clientName: "Sarah Mitchell",
    clientEmail: "sarah.m@gmail.com",
    clientPhone: "0412 345 678",
    channel: "email",
    subject: "Inspection request — 42 Harbour View Drive",
    status: "hot",
    category: "inspection",
    propertyAddress: "42 Harbour View Drive, Mosman",
    propertyPriceGuide: "$4,200,000 – $4,600,000",
    messages: [
      {
        id: "m1",
        sender: "client",
        content:
          "Hi, I've been watching this property for a couple of weeks. We're pre-approved up to $4.5M and would love to arrange a private inspection this weekend if possible. Is the price guide still current?",
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        channel: "email",
      },
      {
        id: "m2",
        sender: "ai",
        content:
          "Good afternoon Sarah, thank you for your interest in 42 Harbour View Drive. The current price guide is $4,200,000 – $4,600,000. I'd be happy to arrange a private inspection — would Saturday or Sunday work better?",
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        channel: "email",
        status: "pending_approval",
      },
    ],
    lastActivity: new Date(Date.now() - 1000 * 60 * 25),
    isRead: false,
  },
  {
    id: "2",
    clientName: "James Chen",
    clientEmail: "james.chen@outlook.com",
    clientPhone: "0423 987 654",
    channel: "email",
    subject: "Price guide for Elm St",
    status: "auto_handled",
    category: "price_only",
    propertyAddress: "18 Elm Street, Surry Hills",
    propertyPriceGuide: "$1,850,000 – $2,050,000",
    messages: [
      {
        id: "m3",
        sender: "client",
        content: "What's the price guide on the Elm St place?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        channel: "email",
      },
      {
        id: "m4",
        sender: "ai",
        content:
          "Hi James, the price guide for 18 Elm Street is $1,850,000 – $2,050,000. Would you like to arrange a viewing?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
        channel: "email",
        status: "sent",
      },
    ],
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 3),
    isRead: true,
  },
  {
    id: "3",
    clientName: "Robert Nguyen",
    clientEmail: "r.nguyen@bigpond.com",
    channel: "email",
    subject: "Price enquiry — Pacific Hwy unit",
    status: "auto_handled",
    category: "price_only",
    propertyAddress: "7/120 Pacific Highway, St Leonards",
    propertyPriceGuide: "$820,000 – $880,000",
    messages: [
      {
        id: "m5",
        sender: "client",
        content:
          "Could you please advise the price guide for the 2-bed unit at 120 Pacific Highway?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18),
        channel: "email",
      },
      {
        id: "m6",
        sender: "ai",
        content:
          "Dear Robert, the guide for 7/120 Pacific Highway is $820,000 – $880,000. The property is currently under offer. Would you like to hear about similar listings?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 17),
        channel: "email",
        status: "sent",
      },
    ],
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 18),
    isRead: true,
  },
  {
    id: "4",
    clientName: "Lisa Patel",
    clientEmail: "lisa.p@gmail.com",
    clientPhone: "0434 567 890",
    channel: "email",
    subject: "Questions about Harbour View Drive",
    status: "needs_attention",
    category: "multi_question",
    propertyAddress: "42 Harbour View Drive, Mosman",
    propertyPriceGuide: "$4,200,000 – $4,600,000",
    messages: [
      {
        id: "m7",
        sender: "client",
        content:
          "Hi, when is the next open inspection for 42 Harbour View Drive? Also, is there parking for two cars?",
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        channel: "email",
      },
      {
        id: "m7b",
        sender: "ai",
        content:
          "Hi Lisa, the next open inspection is Saturday 11:00am. The property has a double garage. Would you like me to register you?",
        timestamp: new Date(Date.now() - 1000 * 60 * 44),
        channel: "email",
        status: "pending_approval",
      },
    ],
    lastActivity: new Date(Date.now() - 1000 * 60 * 45),
    isRead: false,
  },
  {
    id: "5",
    clientName: "David Thompson",
    clientEmail: "dthompson@me.com",
    clientPhone: "0445 321 987",
    channel: "email",
    subject: "Serious interest — pre-auction offer",
    status: "hot",
    category: "other",
    propertyAddress: "23 Rose Bay Avenue, Rose Bay",
    propertyPriceGuide: "$6,800,000 – $7,400,000",
    messages: [
      {
        id: "m8",
        sender: "client",
        content:
          "We've inspected twice and are very keen. We'd like to discuss making a pre-auction offer. Our solicitor has reviewed the contract. When can we speak?",
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        channel: "email",
      },
      {
        id: "m8b",
        sender: "ai",
        content:
          "Good afternoon David, thank you for your continued interest in 23 Rose Bay Avenue. I'll have our principal reach out to you directly within the hour to discuss your pre-auction intentions.",
        timestamp: new Date(Date.now() - 1000 * 60 * 9),
        channel: "email",
        status: "pending_approval",
      },
    ],
    lastActivity: new Date(Date.now() - 1000 * 60 * 10),
    isRead: false,
  },
];

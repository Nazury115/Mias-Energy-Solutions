# Increment 008 follow-up — job conversations

Henry approved this local follow-up after reviewing the side-by-side mockup. Both the customer and staff job pages already save messages in job history. This follow-up gives each job a shared conversation and records when someone views a message.

## Conversation

- Both portals show earlier messages above a reply box. Open near the most recent message, with older messages accessible by scrolling up. Show the sender, date and Zambia time. Align the viewer's own messages on the right and other people's on the left, with text labels that work without colour.
- Include existing messages and customer-facing staff updates from the same job. Label updates clearly. Keep workflow history and private staff notes in their own sections.
- While the conversation is open, show new messages and receipt changes automatically. When the reader is looking at earlier messages, preserve their position and offer a “New messages” control. Preserve unsent drafts during refreshes. Show a save failure with a retry that cannot duplicate a message.

## Read receipts

- A sender sees “Sent” once the message is saved. Record a first view when another authorized person has the conversation open in a visible, focused tab and the message is on screen. Loading a job list, fetching history or viewing one's own message cannot create a receipt.
- Show “Read by” with the reader's display name and time. On a shared job, each contact's receipt is independent. List only people who actually viewed the message. Retain older messages and start collecting their receipts when viewed after rollout.
- Check active job access on every conversation fetch and receipt write. Derive the reader from the signed-in session and the time from the server. Repeated views preserve the first timestamp. Private staff events and their metadata do not enter the shared thread.

## Acceptance walkthrough

1. Staff opens an existing job and sees the earlier exchange above the reply box. Staff sends a new message and sees “Sent”.
2. Henry views the message in his customer portal. The staff view updates to “Read by Henry” with a time. Henry replies and sees his own receipt when staff views it.
3. A second contact views the same message independently. Check that a background tab, an off-screen message and a revoked contact cannot produce a new receipt.
4. On phone and desktop, scroll back while another person replies. Confirm that the draft and reading position survive, that the new-message control works, and that private notes stay out of the conversation.

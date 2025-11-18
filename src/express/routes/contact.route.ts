import { Router } from 'express';
import { postContact } from '../controllers/contact.controller';
import { validateContact } from '../validators/contact.schema';

const router = Router();

/**
 * @openapi
 * /express/contact:
 *   post:
 *     summary: Send a contact message
 *     tags:
 *       - Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               message:
 *                 type: string
 *             required:
 *               - fullName
 *               - email
 *               - message
 *           examples:
 *             contact:
 *               value:
 *                 fullName: Jane Doe
 *                 email: jane@example.com
 *                 message: Hello, I would like to connect.
 *     responses:
 *       '200':
 *         description: Message sent
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               message: "Message sent successfully"
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               status: "failure"
 *               message: "Invalid request body"
 */
router.post('/', validateContact, postContact);

export default router;


import express from 'express';
import cron from 'node-cron';
import { Resend } from 'resend';
import Pass from '../models/Pass.js';
import User from '../models/User.js';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// Check for expiring passes
const checkExpiringPasses = async () => {
  try {
    console.log('🔄 Checking for expiring passes...');

    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    const expiringPasses = await Pass.find({
      expiryDate: { 
        $gte: today, 
        $lte: threeDaysLater 
      }
    }).populate('routeId').populate('userId');

    if (expiringPasses.length === 0) {
      console.log('✅ No expiring passes found');
      return { message: 'No expiring passes today', count: 0 };
    }

    let emailsSent = 0;
    
    for (const pass of expiringPasses) {
      try {
        const user = await User.findById(pass.userId);
        if (!user || !user.email) continue;

        const expiryDate = new Date(pass.expiryDate).toLocaleDateString();
        const routeName = pass.routeId ? `${pass.routeId.start} to ${pass.routeId.end}` : 'Your route';

        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
          to: user.email,
          subject: '⏰ Your Bus Pass is Expiring Soon!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff6b35;">🚌 Bus Pass Expiry Reminder</h2>
              <p>Dear ${user.firstName || 'Valued Customer'},</p>
              <p>Your monthly bus pass for <strong>${routeName}</strong> will expire on <strong>${expiryDate}</strong>.</p>
              <p>To avoid any inconvenience, please renew your pass before the expiry date.</p>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0; color: #ff6b35;">Pass Details:</h3>
                <p><strong>Route:</strong> ${routeName}</p>
                <p><strong>Expiry Date:</strong> ${expiryDate}</p>
                <p><strong>Fare:</strong> ₹${pass.fare}</p>
              </div>
              <p>Thank you for choosing our transit service!</p>
              <p>Best regards,<br/>Transit Team</p>
            </div>
          `
        });

        emailsSent++;
        console.log(`📧 Email sent to ${user.email}`);
      } catch (emailError) {
        console.error('❌ Error sending email:', emailError);
      }
    }

    return { 
      message: `Expiry notifications sent to ${emailsSent} users`, 
      count: emailsSent,
      totalExpiring: expiringPasses.length
    };

  } catch (error) {
    console.error('❌ Error checking expiring passes:', error);
    throw error;
  }
};

// Manual trigger for checking expiring passes
router.get('/check-expiring', async (req, res) => {
  try {
    const result = await checkExpiringPasses();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule cron job to run daily at 9 AM
if (process.env.NODE_ENV !== 'test') {
  cron.schedule('0 9 * * *', async () => {
    console.log('🕘 Running scheduled pass expiry check...');
    try {
      await checkExpiringPasses();
    } catch (error) {
      console.error('❌ Scheduled job error:', error);
    }
  });
  
  console.log('✅ Pass expiry notification cron job scheduled (9:00 AM daily)');
}

export default router;

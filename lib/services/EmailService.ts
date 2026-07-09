import { Resend } from 'resend';
import { Order } from '@/lib/config/supabase.config';
import { logger } from '@/lib/utils/logger';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'JuisteBod <onboarding@resend.dev>';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'info@juistebod.nl';

// Escape klantinvoer voordat die in e-mail-HTML terechtkomt (voorkomt HTML-injectie)
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class EmailService {
  static async sendCustomerConfirmation(order: Order): Promise<boolean> {
    try {
      const propertyData = order.property_data || {};
      const address = escapeHtml(propertyData.address || 'Niet beschikbaar');
      const firstName = escapeHtml(order.first_name);

      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: order.email,
        subject: 'Betaling bevestigd - JuisteBod.nl',
        html: `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#FAF9F6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF9F6;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        
        <!-- Header -->
        <tr>
          <td style="background-color:#1F3C88;padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">JuisteBod.nl</h1>
          </td>
        </tr>

        <!-- Success icon + title -->
        <tr>
          <td style="padding:40px 40px 20px;text-align:center;">
            <div style="width:64px;height:64px;border-radius:50%;background-color:#E8F0EC;margin:0 auto 20px;line-height:64px;font-size:28px;">&#10003;</div>
            <h2 style="color:#1F3C88;margin:0 0 8px;font-size:22px;">Betaling ontvangen!</h2>
            <p style="color:#666;margin:0;font-size:15px;">Bedankt voor je bestelling, ${firstName}.</p>
          </td>
        </tr>

        <!-- Order details -->
        <tr>
          <td style="padding:0 40px 30px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:8px;padding:20px;">
              <tr><td style="padding:20px;">
                <p style="margin:0 0 12px;font-size:14px;color:#888;">Bestelnummer</p>
                <p style="margin:0 0 20px;font-size:15px;color:#333;font-weight:600;">${order.id}</p>
                <p style="margin:0 0 12px;font-size:14px;color:#888;">Woning</p>
                <p style="margin:0 0 20px;font-size:15px;color:#333;">${address}</p>
                <p style="margin:0 0 12px;font-size:14px;color:#888;">Betaald bedrag</p>
                <p style="margin:0;font-size:15px;color:#1F3C88;font-weight:600;">&euro;${Number(order.amount_paid || 241.94).toFixed(2)} incl. BTW</p>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- What to expect -->
        <tr>
          <td style="padding:0 40px 30px;">
            <h3 style="color:#333;margin:0 0 16px;font-size:17px;">Wat kun je verwachten?</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#555;">
                  <strong style="color:#1F3C88;">1.</strong> Onze vastgoedexpert bekijkt jouw woning en de marktgegevens
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#555;">
                  <strong style="color:#1F3C88;">2.</strong> We stellen een persoonlijk bodadvies op met marktanalyse
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#555;">
                  <strong style="color:#1F3C88;">3.</strong> Binnen <strong>48 uur</strong> ontvang je het rapport per email
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;background-color:#f8f9fa;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0 0 8px;font-size:13px;color:#888;">Vragen? Neem contact met ons op via</p>
            <a href="mailto:info@juistebod.nl" style="color:#1F3C88;font-size:14px;font-weight:600;text-decoration:none;">info@juistebod.nl</a>
            <p style="margin:16px 0 0;font-size:12px;color:#aaa;">&copy; ${new Date().getFullYear()} JuisteBod.nl - Het juiste bod op elke woning</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });

      if (error) {
        logger.error('Failed to send customer confirmation email', { error, orderId: order.id });
        return false;
      }

      logger.info('Customer confirmation email sent', { orderId: order.id, email: order.email });
      return true;
    } catch (error) {
      logger.error('Error sending customer confirmation email', { error, orderId: order.id });
      return false;
    }
  }

  static async sendAdminNotification(order: Order): Promise<boolean> {
    try {
      const propertyData = order.property_data || {};
      const address = escapeHtml(propertyData.address || 'Niet beschikbaar');
      const fundaUrl = escapeHtml(order.property_url || 'Niet beschikbaar');
      const price = escapeHtml(propertyData.price || 'Niet beschikbaar');
      const customerInfo = propertyData.customerInfo || {};
      const additionalInfo = escapeHtml(customerInfo.additionalInfo || 'Geen');
      const firstName = escapeHtml(order.first_name);
      const lastName = escapeHtml(order.last_name);
      const email = escapeHtml(order.email);
      const phone = escapeHtml(order.phone || 'Niet opgegeven');

      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: NOTIFICATION_EMAIL,
        subject: `Nieuwe betaling - ${order.first_name} ${order.last_name}`,
        html: `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
        
        <!-- Header -->
        <tr>
          <td style="background-color:#1F3C88;padding:24px 40px;">
            <h1 style="color:#ffffff;margin:0;font-size:20px;">Nieuwe betaling ontvangen</h1>
          </td>
        </tr>

        <!-- Alert -->
        <tr>
          <td style="padding:30px 40px 20px;">
            <div style="background-color:#E8F0EC;border-radius:8px;padding:16px 20px;">
              <p style="margin:0;font-size:15px;color:#1F3C88;font-weight:600;">
                Er is een nieuwe betaling binnengekomen van ${firstName} ${lastName}
              </p>
            </div>
          </td>
        </tr>

        <!-- Customer info -->
        <tr>
          <td style="padding:10px 40px 20px;">
            <h3 style="color:#333;margin:0 0 12px;font-size:16px;border-bottom:2px solid #1F3C88;padding-bottom:8px;">Klantgegevens</h3>
            <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;">
              <tr><td style="color:#888;width:140px;">Naam</td><td style="color:#333;font-weight:600;">${firstName} ${lastName}</td></tr>
              <tr><td style="color:#888;">Email</td><td style="color:#333;"><a href="mailto:${email}" style="color:#1F3C88;">${email}</a></td></tr>
              <tr><td style="color:#888;">Telefoon</td><td style="color:#333;"><a href="tel:${phone}" style="color:#1F3C88;">${phone}</a></td></tr>
              <tr><td style="color:#888;">Betaald</td><td style="color:#1F3C88;font-weight:600;">&euro;${Number(order.amount_paid || 241.94).toFixed(2)}</td></tr>
            </table>
          </td>
        </tr>

        <!-- Property info -->
        <tr>
          <td style="padding:10px 40px 20px;">
            <h3 style="color:#333;margin:0 0 12px;font-size:16px;border-bottom:2px solid #7C8471;padding-bottom:8px;">Woninggegevens</h3>
            <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;">
              <tr><td style="color:#888;width:140px;">Adres</td><td style="color:#333;font-weight:600;">${address}</td></tr>
              <tr><td style="color:#888;">Vraagprijs</td><td style="color:#333;">${price}</td></tr>
              <tr><td style="color:#888;">Funda link</td><td><a href="${fundaUrl}" style="color:#1F3C88;word-break:break-all;">${fundaUrl}</a></td></tr>
            </table>
          </td>
        </tr>

        <!-- Additional info -->
        <tr>
          <td style="padding:10px 40px 30px;">
            <h3 style="color:#333;margin:0 0 12px;font-size:16px;border-bottom:2px solid #7C8471;padding-bottom:8px;">Aanvullende informatie</h3>
            <p style="margin:0;font-size:14px;color:#555;background-color:#f8f9fa;padding:12px 16px;border-radius:6px;white-space:pre-wrap;">${additionalInfo}</p>
          </td>
        </tr>

        <!-- Order meta -->
        <tr>
          <td style="padding:16px 40px;background-color:#f8f9fa;border-top:1px solid #eee;">
            <table width="100%" cellpadding="2" cellspacing="0" style="font-size:12px;color:#888;">
              <tr><td>Order ID: ${order.id}</td><td style="text-align:right;">Datum: ${new Date(order.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });

      if (error) {
        logger.error('Failed to send admin notification email', { error, orderId: order.id });
        return false;
      }

      logger.info('Admin notification email sent', { orderId: order.id });
      return true;
    } catch (error) {
      logger.error('Error sending admin notification email', { error, orderId: order.id });
      return false;
    }
  }

  static async sendPaymentEmails(order: Order): Promise<void> {
    await Promise.all([
      this.sendCustomerConfirmation(order),
      this.sendAdminNotification(order),
    ]);
  }

  static async sendVerificationCode(email: string, firstName: string, code: string): Promise<boolean> {
    try {
      const safeFirstName = escapeHtml(firstName);
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Jouw verificatiecode: ${code} — JuisteBod.nl`,
        html: `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#FAF9F6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF9F6;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr>
          <td style="background-color:#1F3C88;padding:28px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">JuisteBod.nl</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 20px;text-align:center;">
            <h2 style="color:#1F3C88;margin:0 0 8px;font-size:20px;">Bevestig je e-mailadres</h2>
            <p style="color:#555;margin:0 0 32px;font-size:15px;">Hoi ${safeFirstName}, gebruik de onderstaande code om door te gaan met je aanvraag.</p>
            <div style="display:inline-block;background-color:#F0F4FF;border:2px solid #1F3C88;border-radius:12px;padding:20px 48px;">
              <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#1F3C88;">${code}</span>
            </div>
            <p style="color:#888;font-size:13px;margin:24px 0 0;">Deze code is 15 minuten geldig.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;background-color:#f8f9fa;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#aaa;">Als je geen aanvraag hebt gedaan bij JuisteBod.nl, kun je deze e-mail negeren.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });

      if (error) {
        logger.error('Failed to send verification code email', { error, email });
        return false;
      }
      return true;
    } catch (error) {
      logger.error('Error sending verification code email', { error, email });
      return false;
    }
  }

  static async sendAbandonedCartReminder(email: string): Promise<boolean> {
    try {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Je bodadvies aanvraag wacht nog op je — JuisteBod.nl',
        html: `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#FAF9F6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF9F6;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr>
          <td style="background-color:#1F3C88;padding:28px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">JuisteBod.nl</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;text-align:center;">
            <h2 style="color:#1F3C88;margin:0 0 16px;font-size:22px;">Je aanvraag is nog niet afgerond</h2>
            <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
              Je was bezig met een bodadvies aanvraag op JuisteBod.nl. Wil je alsnog het juiste bod bepalen voor jouw droomwoning?
            </p>
            <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 32px;">
              Onze ervaren makelaars staan klaar om binnen 48 uur een persoonlijk en onderbouwd advies op te stellen — voor slechts €199,95 excl. BTW.
            </p>
            <a href="https://www.juistebod.nl" style="display:inline-block;background-color:#1F3C88;color:#ffffff;font-size:16px;font-weight:600;padding:14px 36px;border-radius:50px;text-decoration:none;">
              Ga verder met mijn aanvraag →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;background-color:#f8f9fa;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#aaa;">JuisteBod.nl · Het juiste bod op elke woning · <a href="mailto:info@juistebod.nl" style="color:#888;">info@juistebod.nl</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });

      if (error) {
        logger.error('Failed to send abandoned cart reminder', { error, email });
        return false;
      }
      logger.info('Abandoned cart reminder sent', { email });
      return true;
    } catch (error) {
      logger.error('Error sending abandoned cart reminder', { error, email });
      return false;
    }
  }
}

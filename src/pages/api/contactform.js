import nodemailer from "nodemailer";

export async function post({ request }) {
  //Gets the secret keys from the environment variables
  const secretKey = import.meta.env.SECRET_ACCESSE_CONTACT_FORM_KEY;
  const smtpUser = import.meta.env.SMTP_USER_SECRET;
  const smtpPass = import.meta.env.SMTP_SECRET_PASS;

  //Process formData
  const formData = await request.formData();
  const email = formData.get("email");
  const subject = formData.get("subject");
  const message = formData.get("message");

  //Field Validation
  if (!email || !subject || !message) {
    return new Response(
      JSON.stringify({ error: "Please fill in all required fields." }),
      { status: 400 }
    );
  }

  // Email Validation (basic format)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(
      JSON.stringify({ error: "Invalid email address." }),
      { status: 400 }
    );
  }

  // Subject and message length validation
  if (subject.length < 3 || subject.length > 100) {
    return new Response(
      JSON.stringify({ error: "Subject must be between 3 and 100 characters." }),
      { status: 400 }
    );
  }

  if (message.length < 30 || message.length > 2000) {
    return new Response(
      JSON.stringify({
        error: "Message must be between 30 and 2000 characters.",
      }),
      { status: 400 }
    );
  }

  // Validate the secret key
  if (secretKey !== import.meta.env.SECRET_ACCESSE_CONTACT_FORM_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized access." }), {
      status: 403,
    });
  }

  // Configure mail transport with Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail", // SMTP provider
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  // Email details
  const mailOptions = {
    from: email,
    to: "juedsay@gmail.com",
    subject: `Contact Form: ${subject}`,
    text: `You have a new message from ${email}:\n\n${message}`,
  };

  try {
    // Send the mail
    await transporter.sendMail(mailOptions);
    return new Response(
      JSON.stringify({ success: "Message sent successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send the message. Please try again." }),
      { status: 500 }
    );
  }
}

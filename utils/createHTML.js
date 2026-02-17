module.exports.createHtml = (otp, mail, name) => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your OTP Code</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .header {
        background: #4a90e2;
        color: #ffffff;
        text-align: center;
        padding: 20px;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
      }
      .content {
        padding: 30px;
        text-align: center;
        color: #333333;
      }
      .otp-box {
        display: inline-block;
        background: #f0f4ff;
        color: #4a90e2;
        font-size: 28px;
        font-weight: bold;
        letter-spacing: 4px;
        padding: 15px 25px;
        border-radius: 6px;
        margin: 20px 0;
      }
      .footer {
        background: #f4f6f8;
        text-align: center;
        padding: 15px;
        font-size: 12px;
        color: #777777;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Email Verification</h1>
      </div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>Use the following One-Time Password (OTP) to verify your email address:</p>
        <div class="otp-box">${otp}</div>
        <p>This code is valid for the next 10 minutes. Please do not share it with anyone.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Daamrideals. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

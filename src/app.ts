import Bull, { Job } from 'bull'

import express from 'express'
import bodyParser from 'body-parser'
import nodeMailer from 'nodemailer'

const app = express()
const emailQueue = new Bull('email')

app.use(bodyParser.json())

type EmailType = {
  from: string
  to: string
  subject: string
  text: string
}

// ? 1. Add Email to Queue
const sendNewEmail = async (email: EmailType) => {
  emailQueue.add({ ...email })
}

// app.post('/send-email', async (req, res) => {
//   const { from, to, subject, text } = req.body

//   const testAccount = await nodeMailer.createTestAccount()

//   const transporter = nodeMailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     secure: false,
//     auth: {
//       user: testAccount.user,
//       pass: testAccount.pass,
//     },
//     tls: {
//       rejectUnauthorized: false,
//     },
//   })

//   console.log('Sending mail to %s', to)

//   let info = await transporter.sendMail({
//     from,
//     to,
//     subject,
//     text,
//     html: `<strong>${text}</strong>`,
//   })

//   console.log('Mesaage sent: %s', info.messageId)
//   console.log('Preview URL: %s', nodeMailer.getTestMessageUrl(info))

//   res.json({
//     message: 'Email sent',
//   })
// })

// ? 2. Process Email Queue
const processEmailQueue = async (job: Job) => {
  const testAccount = await nodeMailer.createTestAccount()

  // ? 3. Send Email
  const transporter = nodeMailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })

  const { from, to, subject, text } = job.data

  console.log('Sending mail to %s', to)

  // * Email info
  let info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html: `<strong>${text}</strong>`,
  })

  console.log('Mesaage sent: %s', info.messageId)
  console.log('Preview URL: %s', nodeMailer.getTestMessageUrl(info))

  return nodeMailer.getTestMessageUrl(info)
}

// ? 5. Process the Queue
emailQueue.process(processEmailQueue)

// ? 6. Endpoint to send email
app.post('/send-email', async (req, res) => {
  const { from, to, subject, text } = req.body

  await sendNewEmail({ from, to, subject, text })

  console.log('Added to queue')

  res.json({
    message: 'Email Sent',
  })
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})

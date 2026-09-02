import { PolicyPage, type PolicySection } from "@/components/policy-page";

const sections: PolicySection[] = [
  { title: "1. Acceptance of Terms", paragraphs: ["By accessing or purchasing a course from Subhan Academy, you agree to these Terms & Conditions. If you do not agree with any part of these terms, please do not use our website or purchase our courses."] },
  { title: "2. About Subhan Academy", paragraphs: ["Subhan Academy provides educational courses, resources, tutorials, and practical learning materials designed to help learners understand and build online and local businesses."] },
  { title: "3. Course Enrollment & Access", paragraphs: ["After successful payment, the enrolled user will receive access to the purchased course.", "You are responsible for providing accurate information during registration and enrollment."] },
  { title: "4. Account Responsibility", paragraphs: ["You must keep your account credentials secure. Your account is intended for your personal use and should not be shared with other individuals."] },
  { title: "5. Course Content & Intellectual Property", paragraphs: ["All videos, documents, templates, graphics, lessons, and other course materials provided by Subhan Academy are protected content.", "You may use the materials for your personal educational purposes only. You may not copy, reproduce, resell, redistribute, upload, publish, or commercially distribute our course content without written permission."] },
  { title: "6. Payments", paragraphs: ["Course payments are processed through available third-party payment gateways. Prices displayed on the website may be changed from time to time.", "The price applicable at the time of purchase will be shown during checkout."] },
  { title: "7. Refunds", paragraphs: ["Refunds are governed by our Refund Policy. Please review the Refund Policy before purchasing a course."] },
  { title: "8. No Guaranteed Business Results", paragraphs: ["Subhan Academy provides educational information and practical guidance. We do not guarantee any specific income, sales, profit, business growth, or financial results from applying the information provided in our courses.", "Results may vary depending on the learner's skills, effort, market conditions, business model, location, and other factors."] },
  { title: "9. Prohibited Activities", paragraphs: ["You must not use our website or course materials for unlawful activities, unauthorized distribution, fraud, abuse, or any activity that may harm Subhan Academy or other users."] },
  { title: "10. Course Updates", paragraphs: ["We may update, improve, modify, or add new educational content to our courses from time to time."] },
  { title: "11. Third-Party Services", paragraphs: ["Our website may use third-party services such as payment gateways, analytics tools, hosting providers, or other service providers. Their services may be subject to their own terms and policies."] },
  { title: "12. Changes to These Terms", paragraphs: ["Subhan Academy reserves the right to update these Terms & Conditions when necessary. Updated terms will be published on this page."] },
  { title: "13. Contact", paragraphs: ["If you have questions regarding these Terms & Conditions, please contact our support team at subhanacademysupport@gmail.com."] }
];

export default function TermsPage() {
  return <PolicyPage title="Terms & Conditions" sections={sections} />;
}

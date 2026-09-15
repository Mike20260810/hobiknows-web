import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ===========================
// Firebase Configuration
// ===========================

const firebaseConfig = {
  apiKey: "AIzaSyAGWw-w9Z4MsNjG5Ilyoszpnlg1kVLD-6I",
  authDomain: "hobiknows.firebaseapp.com",
  projectId: "hobiknows",
  storageBucket: "hobiknows.firebasestorage.app",
  messagingSenderId: "966528591353",
  appId: "1:966528591353:web:b6dd5473b4c5af60aa0928",
  measurementId: "G-4NLNKX7B5P"
};


// ===========================
// Initialize Firebase
// ===========================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ===========================
// Contact Form
// ===========================

const form = document.querySelector(".contact-form");
const submitButton = form?.querySelector(".contact-submit");
const statusEl = document.getElementById("contact-form-status");


// ===========================
// Status Message
// ===========================

function setStatus(message, state = "") {
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.dataset.state = state;
}


// ===========================
// Submit Button State
// ===========================

function setSubmitting(isSubmitting) {
  if (!submitButton) return;

  submitButton.disabled = isSubmitting;

  if (isSubmitting) {
    submitButton.dataset.originalText = submitButton.innerHTML;

    submitButton.innerHTML = `
      Sending...
      <span>→</span>
    `;
  } else if (submitButton.dataset.originalText) {
    submitButton.innerHTML = submitButton.dataset.originalText;
    delete submitButton.dataset.originalText;
  }
}


// ===========================
// Submit Contact Form
// ===========================

if (form) {

  form.addEventListener("submit", async (event) => {

    event.preventDefault();


    // Browser validation
    if (!form.reportValidity()) {
      return;
    }


    const formData = new FormData(form);


    // Data sent to Firestore
    const payload = {

      name:
        String(formData.get("name") || "").trim(),

      email:
        String(formData.get("email") || "").trim(),

      type:
        String(formData.get("type") || "").trim(),

      subject:
        String(formData.get("subject") || "").trim(),

      message:
        String(formData.get("message") || "").trim(),

      status: "new",

      createdAt: serverTimestamp()

    };


    // Extra validation
    if (
      !payload.name ||
      !payload.email ||
      !payload.type ||
      !payload.subject ||
      !payload.message
    ) {

      setStatus(
        "Please complete all required fields.",
        "error"
      );

      return;
    }


    try {

      setStatus("");

      setSubmitting(true);


      // Save message to Firestore
      await addDoc(
        collection(db, "contactMessages"),
        payload
      );


      // Clear form
      form.reset();


      // Success message
      setStatus(
        "Message sent successfully. Thank you for getting in touch.",
        "success"
      );


    } catch (error) {

      console.error(
        "Contact form submission failed:",
        error
      );


      setStatus(
        "We couldn't send your message. Please try again in a moment.",
        "error"
      );


    } finally {

      setSubmitting(false);

    }

  });

}
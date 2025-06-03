# Simple Self-Hosted CDN Web App

A modern, minimalistic self-hosted CDN web application to upload and serve media files securely behind a single-user login. Perfect for personal media hosting with no file size limits.

---

## Features

- **Single user authentication**  
  - To Change The Username & password go into `server.js` and find the login route.  

- **Secure file uploads**  
  - Drag-and-drop or browse upload any file type  
  - No file size limits  
  - Files saved on the server in `/uploads` directory

- **File display & access**  
  - Images previewed as `<img>` elements  
  - Videos playable via `<video>` tag  
  - Other files shown as clickable download links  
  - No directory listing or browsing allowed for `/uploads` folder

- **Security**  
  - Filename sanitization to prevent security risks  
  - Protected upload and file management pages accessible only after login  
  - Session-based authentication

- **Modern UI**  
  - Responsive and clean design  
  - Upload progress indicator  
  - Mobile friendly

---

## Tech Stack

- Backend: Node.js With Express
- Frontend: HTML, CSS, JavaScript (minimal dependencies)  
- No database required — metadata handled via file system

---

## Getting Started

### Prerequisites

- Ubuntu server or any Linux environment  
- Node.js / Python / PHP installed 
- Web server (Nginx recommended for production)  
- Domain name (optional, but recommended)

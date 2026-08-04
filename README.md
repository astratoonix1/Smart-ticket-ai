# 🧠 Smart Ticketing AI Agent System  

An intelligent AI-powered ticketing system built with **Node.js**, **Express.js**, **Inngest**, **Nodemailer**, and **Google AI** APIs.  
This system automatically assigns tickets, suggests helpful notes, matches skills, and updates ticket status.  

---

## 🚀 Features  

- ✅ **AI Agent Assignment using Google AI API**  
- ✅ **Skill Matching & Ticket Assignment to Moderators**  
- ✅ **Helpful Notes Generation with AI**  
- ✅ **Auto Status Update for Tickets**  
- ✅ **Background Jobs Handling with Inngest**  
- ℹ️ No login/authentication — the app is fully open (no JWT, no email/password)
- ✅ **Clean RESTful API with Express.js**  
- ✅ **Modular Code Structure (Backend + Frontend)**  

---

## ▶️ Demo
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d6362102-4843-48e4-9653-d74203e77f16" />

---
<img width="1919" height="923" alt="image" src="https://github.com/user-attachments/assets/2b70a2dd-75c5-4e32-a719-5a1e32ddf10a" />

---
<img width="1759" height="787" alt="image" src="https://github.com/user-attachments/assets/834ecd6d-ff5a-49f9-9820-fc9866b8e706" />

---
<img width="1919" height="929" alt="image" src="https://github.com/user-attachments/assets/1a174080-7b2e-43fd-9089-83652265980c" />



## 🛠️ Tech Stack  

- **Backend:** Node.js, Express.js  
- **AI Integration:** Google AI Studio (Gemini API)  
- **Background Jobs:** Inngest  
- **Email Service:** Nodemailer  
- **Database:** (MongoDB)  
- **Frontend:** (Vite React)  

---

### 🗺️ System Overview
```

                                Client App ──▶ Express Server ──▶ MongoDB
                                                      │  
                                                      ├──▶ Inngest Queue ──▶ Google Gemini AI  
                                                      └──▶ Nodemailer  

```

## 📂 Project Folder Structure  

```
SmartTicket-AI
├── BACKEND
│   ├── controllers
│   ├── middlewares
│   ├── models
│   ├── routes
│   ├── utils
│   ├── inngest
│   ├── .env
│   ├── index.js
│   ├── package.json
├── FRONTEND
│   ├── components
│   │   ├── admin
│   │   ├── auth
│   │   ├── common
│   │   ├── tickets
│   ├── contexts
│   ├── hooks
│   ├── services
│   ├── .env
│   ├── App.tsx
│   ├── index.tsx
│   ├── package.json
├── README.md   
```
---

## ⚙️ How AI Agent Works  

1️⃣ User creates a ticket  
2️⃣ AI Agent reads the ticket & analyzes it via Google AI API  
3️⃣ Suggests **Helpful Notes**  
4️⃣ Matches **Relevant Skills** with Moderators  
5️⃣ Auto assigns the ticket to best-fit Moderator  
6️⃣ Updates ticket **Status**  
7️⃣ Runs background tasks using **Inngest**  

---

## 🖥️ Local Setup
1️⃣ Clone the Repo
```
git clone https://github.com/rajveer-09/SmartTicket-AI.git
cd SmartTicket-AI/BACKEND
```
## 2️⃣ Install Dependencies
```
npm install
```
### 3️⃣ Configure .env (BACKEND)
```
MONGO_URI=
PORT=
GEMINI_API_KEY=
```

### Configure .env (FRONTEND)
```
VITE_API_URL=
```
✅ Don't forget to add .env in .gitignore

---
### 4️⃣ Start the Server
```
npm start
```

### 🚀 Deployment Tips
- Recommended Platforms: Render, Railway, Vercel, Heroku
- Add environment variables securely
- Keep your secrets safe

### 🤝 Contributing
```
Fork & Clone
Create a new feature branch
Raise a Pull Request
```
---
### 👨‍💻 Author
- Rajveer Sharma

- [GitHub](https://github.com/rajveer-09)
- [LinkedIn](https://www.linkedin.com/in/rajveer-sharma933/)

---

### 📄 License
- MIT License

---
### 🙌 Special Thanks
- Inngest — Event-driven jobs
- Google AI Studio — AI Capabilities
- Nodemailer — Email Services

---
  ## 📊 System Architecture
```
                                    ┌───────────────────────────────────────────────────────┐
                                    │                    Client Application                 │
                                    └──────────────────────────┬────────────────────────────┘
                                                               │
                                    ┌──────────────────────────▼────────────────────────────┐
                                    │                   Express Server                      │
                                    │  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │
                                    │  │ Auth Routes │  │Ticket Routes│  │ Admin Routes  │  │
                                    │  └─────────────┘  └─────────────┘  └───────────────┘  │
                                    └───────────┬──────────────────────────────┬────────────┘
                                                │                              │
                                    ┌───────────▼─────────────┐    ┌──────────▼───────────┐
                                    │       MongoDB           │    │   Inngest Queue      │
                                    │  ┌───────────────────┐  │    │  ┌────────────────┐  │
                                    │  │     Tickets       │  │    │  │  AI Processing │  │
                                    │  ├───────────────────┤  │    │  ├────────────────┤  │
                                    │  │     Users         │  │    │  │ Notifications  │  │
                                    │  ├───────────────────┤  │    │  ├────────────────┤  │
                                    │  │   Moderators      │  │    │  │  Assignments   │  │
                                    │  └───────────────────┘  │    │  └────────────────┘  │
                                    └─────────────────────────┘    └──────────────────────┘
                                                │                              │
                                                └──────────────┬───────────────┘
                                                               │
                                                     ┌─────────▼─────────┐
                                                     │  Google Gemini AI │
                                                     └───────────────────┘

```

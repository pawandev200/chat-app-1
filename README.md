# ✨ Realtime Chat App ✨

Welcome to the Full-Stack Realtime Chat Application! This project is designed to deliver a seamless and interactive communication experience with modern features.

## 🚀 Features

- **Secure Authentication & Authorization:**
  Secure user authentication system with JWT (JSON Web Tokens) ensures user login and access control.

- **Real-Time Messaging:**
  Enabled real-time messaging functionality through Socket.io, providing users with instant message delivery and a dynamic chat experience with notification sounds for new messages.

- **Online User Status:**
  Implemented online user status feature using Socket.io and React Context, allowing users to see the online status of other users.

- **Profile Updates with Media Sharing:**
  Update user profiles and share photos securely via Cloudinary, enhancing personalization and interaction.
- **Customizable Themes:**
  The application offers 32 dynamic themes, enabling users to personalize their chat experience. With themes like Light, Dark, Cupcake, and more, users can effortlessly switch between them for a customized and enjoyable interface.
- **Global State Management:**
  Utilized Zustand for effective global state management, ensuring seamless state updates across components.

- **Dynamic & Responsive UI:**
  Built with TailwindCSS and Daisy UI for a visually appealing and user-friendly interface, enhancing the overall user experience.


---

## 🛠️ Tech Stack

### **Frontend**

- React.js
- TailwindCSS
- Daisy UI

### **Backend**

- Node.js
- Express.js

### **Database**

- MongoDB

### **Real-Time Functionality**

- Socket.io

### **Authentication & Authorization**

- JWT (JSON Web Tokens)

### **State Management**

- Zustand

### **Media Management**

- Cloudinary

### **Deployment**

- Render

---

## 🎯 How to Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/pawandev200/chat-app-1.git
   ```

2. Navigate to the project directory:

   ```bash
   cd chat-app-1
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Setup .env file:

   ```js
   MONGODB_URI=...
   PORT=5001
   JWT_SECRET=...

   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...

   NODE_ENV=development
   ```

5. Build the app:

   ```shell
   npm run build
   ```

6. Start the app:

   ```shell
   npm start
   ```

7. Open your browser and navigate to `http://localhost:5001` to access the app.

---

## 📈 Future Enhancements

- Group Chat Support
- Typing Indicators
- Message Read Receipts
- Audio and Video Calls
- AI Integration

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

🌟 **Experience seamless communication with this real-time chat application today!**


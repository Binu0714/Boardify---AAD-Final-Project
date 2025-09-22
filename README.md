# Boardify – Student Accommodation Finder in Sri Lanka

**Boardify** is a modern, secure, and user-friendly web platform designed to help university students in Sri Lanka easily find safe and suitable accommodation. This platform connects students searching for housing with property owners while ensuring verified and reliable listings through an admin panel.

---

## 🚀 Features

### User Features
- Sign up and log in (also supports Google login)  
- Dashboard with ad statistics and notifications  
- Browse all ads with search and filter options  
- View detailed property information including photos, amenities, and location  
- Post property ads for rent with admin verification  
- Send and receive booking requests  
- Profile management and edit own ads  

### Admin Features
- Admin dashboard with system statistics and charts  
- User management (edit/remove users)  
- Approve or reject pending property listings  
- View all listings including booked properties  
- Admin profile management  

---

## 💻 Technologies Used
- **Backend:** Java Spring Boot (REST Controllers)  
- **Database:** MySQL / PostgreSQL  
- **Security:** Spring Security with JWT Authentication  
- **ORM:** Spring Data JPA  
- **API Integrations:** LocationIQ, Voyage, ImgBB (for image hosting)  
- **API Testing:** Postman  

---

## 📸 Screenshots

### 🔑 Authentication
- **Login Page**
  ![Login](screenshots/logIn.jpg)

- **Sign Up Page**
  ![Sign Up](screenshots/signUp.jpg)

### 🏠 User Side
- **Landing Page**
  ![Landing Page](screenshots/landingPage.jpg)

- **User Dashboard**
  ![User Dashboard](screenshots/userDashboard.jpg)

- **User Profile**
  ![User Profile](screenshots/userProfile.jpg)

- **User Ads**
  ![User Ads](screenshots/userMyAds.jpg)

- **All Ads**
  ![All Ads](screenshots/userAllAds.jpg)

- **Booking Ad**
  ![Booking Ad](screenshots/userBookingAdd.jpg)

- **Post Ad**
  ![Post Ad](screenshots/userPostAdd.jpg)

- **Notifications**
  ![Notifications](screenshots/userNotification.jpg)

### 👨‍💼 Admin Side
- **Admin Dashboard**
  ![Admin Dashboard](screenshots/adminDashboard.jpg)

- **Admin Profile**
  ![Admin Profile](screenshots/adminProfile.jpg)

- **Manage Users**
  ![Manage Users](screenshots/adminUserManage.jpg)

- **View Ads**
  ![View Ads](screenshots/adminViewAdd.jpg)

- **Confirm Ads**
  ![Confirm Ads](screenshots/adminConfirmAdd.jpg)


## 🎥 Demo Video
Watch the full project demonstration here:  
[https://youtu.be/uHcjZ4TLW-E](https://youtu.be/XbZz5JYh990?si=MePBvUnr_3Aae_I6)

---

## 🏠 Sample Property Ads
Boardify supports listings like **Houses, Annexes, Single Rooms, Shared Rooms** near Sri Lankan universities. Features include price, bedrooms/bathrooms, amenities, nearest campus, city, and district.  

---

## 📂 Project Structure
- **Controllers:** Handle REST endpoints and requests  
- **Services:** Business logic and service layer  
- **Repositories:** Database operations using Spring Data JPA  
- **Entities:** Represent database tables (Users, Properties, Ads, Bookings, etc.)  
- **Security:** JWT-based authentication and authorization  

---

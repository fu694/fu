import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// ✅ 1. Initialize Firebase Configuration (Replace with Your Firebase Details)
const firebaseConfig = {
    apiKey: "AIzaSyBotf9wLzGYH54FVHV4EbmWEjzTDXn_IQI",
    authDomain: "oclock-8378b.firebaseapp.com",
    projectId: "oclock-8378b",
    storageBucket: "oclock-8378b.firebasestorage.app",
    messagingSenderId: "217669506746",
    appId: "1:217669506746:web:b5af90b413170603601483",
    measurementId: "G-TDG40NE9M2"
};

// ✅ 2. Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ 3. Admin Email (Replace with your actual admin email)
const ADMIN_EMAIL = "namafu694@gmail.com";

// ✅ 4. DOM Elements
const pendingImagesDiv = document.getElementById("pendingImages");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const adminEmailDisplay = document.getElementById("adminEmail");

// =======================================================
// 👤 5. Authentication Handling
// =======================================================

//Handle user authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User logged in:", user.email);

        if (user.email === ADMIN_EMAIL) {
            document.getElementById("adminEmail").textContent = user.email;
            loadPendingImages();
            document.getElementById("loginButton").style.display = "none";
            document.getElementById("logoutButton").style.display = "block";
        } else {
            alert("Access denied! Only admin can view this page.");
            signOut(auth); // Logs out unauthorized users
            window.location.href = "index.html";
        }
    } else {
        console.log("No user is logged in.");
        document.getElementById("loginButton").style.display = "block";
        document.getElementById("logoutButton").style.display = "none";
    }
});

// 🔓 Google Login
document.getElementById("loginButton").addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        if (result.user.email !== ADMIN_EMAIL) {
            alert("You are not authorized to access this page.");
            await signOut(auth);
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("Login error:", error);
    }
});

// 🔓 Logout
document.getElementById("logoutButton").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
});

// 📥6. Load Pending Images
async function loadPendingImages() {
    console.log("Loading pending images...");
   

    try{
    const imagesCollection = collection(db, "numbers");
    const querySnapshot = await getDocs(imagesCollection);
    const pendingImagesDiv = document.getElementById("pendingImages");

    pendingImagesDiv.innerHTML = ""; // Clear previous content

    querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        console.log("Document data:", data);

       
        // 🔥 ここで imageUrl の null チェックを追加
        if (!data.imageUrl || data.imageUrl === null || data.imageUrl.trim() === "") { 
            console.warn(`Skipping document (missing or null imageUrl):`, data);
            return; // 🚫 画像URLが無いデータはスキップ
        }

        //check if the image status is pending
        if (data.status === "pending") {  
            const div = document.createElement("div");
            div.innerHTML = `
                <img src="${data.imageUrl}" style="width: 100px; margin: 5px;">
                <p>Number: ${data.number}</p>
                <button onclick="approveImage('${docSnapshot.id}')">Approve</button>
                <button onclick="rejectImage('${docSnapshot.id}')">Reject</button>
            `;
            pendingImagesDiv.appendChild(div);
        }
    });

  }catch(error) {
    console.error("❌ Error setting admin role:", error);
  }
}

const displayImage = (doc) => {
    const data = doc.data();
    const img = document.createElement('img');
    
    if (imageUrl) {
        img.src = imageUrl;  // ✅ Use uploaded image
    } else if (canvasData) {
        img.src = canvasData;  // ✅ Use canvas drawing
    } else {
        img.src = "/images/default-number.png";  // ✅ Fallback image
    }

    img.alt = "Uploaded Image";
    img.style.width = "100px";  // Adjust as needed

    return img;
};

// =======================================================
// ✅ 7. Approve and Reject Image Function
// =======================================================

// ✅ Approve Image
window. approveImage = async (docId) => {
    try {
        const docRef = doc(db, "numbers", docId);
        await updateDoc(docRef, { status: "approved" });

        console.log("✅ Image approved!");
        document.getElementById(`status-${docId}`).textContent = "Approved";
        loadPendingImages();
    } catch (error) {
        console.error("❌ Error approving image:", error);
    }
};

// ❌ Reject Image
const rejectImage = async (docId) => {
    try {
        const docRef = doc(db, "numbers", docId);
        await updateDoc(docRef, { status: "rejected" });

        console.log("❌ Image rejected!");
        document.getElementById(`status-${docId}`).textContent = "Rejected";
        loadPendingImages();
    } catch (error) {
        console.error("🔥 Error rejecting image:", error);
    }
};



// =======================================================
// 🖼️ 9. Load Images on Page Load
// =======================================================
document.addEventListener("DOMContentLoaded", function() {
    loadPendingImages();
});

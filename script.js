import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { query, where } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { writeBatch } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// 1Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBotf9wLzGYH54FVHV4EbmWEjzTDXn_IQI",
  authDomain: "oclock-8378b.firebaseapp.com",
  projectId: "oclock-8378b",
  storageBucket: "oclock-8378b.firebasestorage.app",
  messagingSenderId: "217669506746",
  appId: "1:217669506746:web:b5af90b413170603601483",
  measurementId: "G-TDG40NE9M2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//2FETCH AND DISPLAY IMAGES FROM FIRESTORE
async function fetchAndDisplayImages() {
  const imageGallery = document.getElementById("image-gallery"); // 画像表示用のコンテナ
  imageGallery.innerHTML = ""; // Clear previous images
  const imagesCollection = collection(db, "images"); // コレクション名を指定

  try {
    const querySnapshot = await getDocs(imagesCollection);
    querySnapshot.forEach((doc) => {
      const data = doc.data(); // ドキュメントのデータを取得
      const imageUrl = data.imageUrl; //get URL field

      // create and append image element
      const imgElement = document.createElement("img");
      imgElement.src = imageUrl;
      imgElement.alt = data.fileName;
      imgElement.style.width = "200px"; 
      imgElement.style.borderRadius = "10px";
      imgElement.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";

      FragmentDirective.appendChild(imgElement);
      
    });
    const fragment = document.createDocumentFragment();
    fragment.appendChild(imgElement);
    imageGallery.appendChild(fragment);
  } catch (error) {
    console.error("Error fetching images from firestore:", error);
  }
}

// load images on page load
fetchAndDisplayImages();

//3PAGE NAVIGATION FOR HOMEPAGE AND UPLOADPAGE
// page Elements
const homePage = document.getElementById('homePage');
const uploadPage = document.getElementById('uploadPage');

const digitalClock = document.getElementById('digitalClock');
const postButton = document.getElementById('postButton');
const postStatus = document.getElementById('postStatus');

const fileInput = document.getElementById('fileInput');

// Page Navigation with button
const toUploadPageButton = document.getElementById('toUploadPage');
toUploadPageButton.addEventListener('click', () => {
  homePage.style.display = 'none';
  uploadPage.style.display = 'block';
});
 // 🔹 `uploadPage` が表示されたら `postButton` を取得
 setTimeout(() => {
  const postButton = document.getElementById("postButton");
  if (postButton) {
    console.log("✅ postButton (after display):", postButton);
const backButton = document.getElementById('backButton');
backButton. addEventListener('click', () => {
  uploadPage.style.display = 'none';
  homePage.style.display ='block';
});
  }})

//4CANVAS DRAWING SETUP
const drawCanvas = document.getElementById('drawCanvas');
const clearCanvas = document.getElementById('clearCanvas');
const penColorInput = document.getElementById('penColor');
const penSizeInput = document.getElementById('penSize');
//canvas setup
const ctx = drawCanvas.getContext('2d');
ctx.fillStyle = "white";
ctx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
let drawing = false;
let penColor = "#000000";
let penSize = 2;

// Pen Settings
penColorInput.addEventListener('change', (e) => {
  penColor = e.target.value;
});

penSizeInput.addEventListener('change', (e) => {
  penSize = parseInt(e.target.value);
});

// Drawing Events
drawCanvas.addEventListener('mousedown', () => (drawing = true));
drawCanvas.addEventListener('mouseup', () => (drawing = false));
drawCanvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  ctx.beginPath();
  ctx.arc(e.offsetX, e.offsetY, penSize / 2, 0, 2 * Math.PI);
  ctx.fillStyle = penColor;
  ctx.fill();
});

//clear canvas
clearCanvas.addEventListener('click', () => {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
});




//6UPLOAD IMAGE TO IMGUR
async function uploadImageToImgur(file) {
  const CLIENT_ID = "732a35e7ea2fbb6"; // ① ImgurのクライアントID
  const formData = new FormData();
  formData.append("image", file);

  try {
    console.log("Uploading image to Imgur...");
    const response = await fetch("https://api.imgur.com/3/upload", {
        method: "POST",
        headers: { Authorization: `Client-ID ${CLIENT_ID}` },
        body: formData,
    });

    const result = await response.json();
    console.log("Imgur Upload Response:", result); // 🛠 DEBUG HERE
    
    if (result.success && result.data.link) {
        console.log("✅ Uploaded to Imgur:", result.data.link);
        return result.data.link; // ✅ Return the Imgur URL
    } else {
      console.error("❌ Imgur upload failed:", result);  // Shows full response
      console.error(`⚠️ Error message: ${result.data?.error || "Unknown error"}`);  // Prevents undefined errors
      return null;
    }
} catch (error) {
    console.error("❌ Error uploading to Imgur:", error);
    return null;
}
}
const testFile = new File(["dummy content"], "test.png", { type: "image/png" });

uploadImageToImgur(testFile).then((imgurUrl) => {
    if (imgurUrl) {
        console.log("🚀 Image uploaded successfully:", imgurUrl);
    } else {
        console.error("❌ Upload failed!");
    }
});



//saveimage url to firestore

async function saveImageUrlToFirestore(imageUrl, number) {
  try {
      await addDoc(collection(db, "numbers"), {
          number: number,  // The number associated with the image
          imageUrl: imageUrl,  // The uploaded image URL
          status: "pending",  // 🟡 Mark as pending
          timestamp: serverTimestamp()
      });
      console.log("Image URL saved successfully!");
  } catch (error) {
      console.error("Error saving image URL: ", error);
  }
}





//7POSTING DATA TO FIREBASE
//post button
document.addEventListener("DOMContentLoaded", () =>{
postButton.addEventListener('click', async () => {
  console.log("Post button clicked!")

  const selectedNumber = document.querySelector('.numberButton.selected');
  if (!selectedNumber) {
    postStatus.textContent = 'Status: Please select a number.';
    postStatus.style.color = "red"; // Error message in red
    return;
  }

  const number = selectedNumber.textContent;
  const canvasData = drawCanvas.toDataURL();
  const file = fileInput.files[0];
  let imageUrl = null;

  if (file) {
    imageUrl = await uploadImageToImgur(file);
    if (!imageUrl) {
        console.error("❌ Error: Image upload failed. Aborting Firestore upload.");
        postStatus.textContent = "Status: Error - Image upload failed.";
        postStatus.style.color = "red";
        return;  // Stop execution if upload fails
    }
}
  

  if (!canvasData && !file) {
    postStatus.textContent = 'Status: Please draw or select an image.';
    postStatus.style.color = "red";
    return;
  }

  try {
    console.log("Uploading data to Firestore...");
    const batch = writeBatch(db); // ✅ Use batch writes

    const docRef = doc(collection(db,'numbers'));

      batch.set(docRef, {
      number: number,
      canvasData: file ? null : canvasData,
      fileName: file ? file.name : null,
      imageUrl: imageUrl ||null,
      status: 'checking',
      timestamp: serverTimestamp()
    });

    //post status
    await batch.commit(); // ✅ Save all at once
    console.log("Image posted successfully!")

    postStatus.textContent = 'Status: Uploaded successfully.';
    postStatus.style.color = "green"; // Success message in green
  } catch (error) {
    console.error("Firestore upload error:", error);
    postStatus.textContent = `Status: Error - ${error.message}`;
    postStatus.style.color = "red";
  }
})
});



document.querySelectorAll('.numberButton').forEach((button) => {
  button.addEventListener('click', (e) => {
    // Remove 'selected' class from all buttons
    document.querySelectorAll('.numberButton').forEach((btn) => btn.classList.remove('selected'));
    
    // Add 'selected' class to the clicked button
    e.target.classList.add('selected');

    // Change background color for visual feedback
    e.target.style.backgroundColor = "#4CAF50"; // Green when selected
    e.target.style.color = "white";

    // Reset other buttons' styles
    document.querySelectorAll('.numberButton').forEach((btn) => {
      if (!btn.classList.contains('selected')) {
        btn.style.backgroundColor = ""; // Default color
        btn.style.color = "";
      }
    });
  });
});


//8DIGITAL CLOCK WITH IMAGES
//fetch approved images
async function fetchApprovedImages() {
  const imagesCollection = collection(db, "numbers");
  const q = query(imagesCollection, where("status", "==", "approved")); // ✅ Filtered query
  const querySnapshot = await getDocs(q);

  console.log("Approved Images Query Snapshot:", querySnapshot.docs.map(doc => doc.data())); // Debugging
  const numberImages = {}; // ✅ Store images for numbers 0-9
  

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.number && data.status === "approved") {
      if (data.imageUrl) {
        numberImages[data.number] = data.imageUrl;  // Use uploaded file
      } else if (data.canvasData) {
        numberImages[data.number] = data.canvasData;  // Use base64 canvas data
      } else {
        console.warn(`No image found for number ${data.number}`);
      }
    }
  });

  console.log("Number Images:", numberImages); // Debugging
  return numberImages;

}
// Clock Logic
async function updateClockWithImages() {
  const numberImages = await fetchApprovedImages();

  console.log("Number Images:", numberImages); // Debugging
  const now = new Date();

  const gmtTime = new Date(now.toUTCString());
  const hours = String(gmtTime.getHours()).padStart(2, '0');
  const minutes = String(gmtTime.getMinutes()).padStart(2, '0');
  const seconds = String(gmtTime.getSeconds()).padStart(2, '0');
  const timeString = `${hours}:${minutes}:${seconds}`;


digitalClock.innerHTML = ""; // Clear the existing text

// Replace each character with an image or text
    for (let char of timeString) {
      if (char === ":") {
          // Display ":" as text
          const colonSpan = document.createElement("span");
          colonSpan.textContent = ":";
          colonSpan.style.fontSize = "2rem";
          digitalClock.appendChild(colonSpan);
      } else {
          // Display number as an image
          const img = document.createElement("img");
          img.src = numberImages[char] || "/path-to-your-default-image/default-number.png"; // Use default if missing
          img.setAttribute("style", "width: 80px; height: auto; margin: 2px;"); // ✅ 強制適用
          digitalClock.appendChild(img);
      }
    }
  }

// Clock update interval (only updates time, images are real-time)
setInterval(updateClockWithImages, 1000);



function displayImage(imageUrl) {
    const img = document.createElement("img");
    img.src = imageUrl;
    img.style.width = "200px"; // 画像サイズ
    document.body.appendChild(img);
}

fetchImages(); // 画像一覧を取得して表示

//approve


// function to display pending images for admin review
async function loadPendingImages() {
  console.log("Loading pending images...")
    const imagesCollection = collection(db, "numbers");
    const querySnapshot = await getDocs(imagesCollection);
    const pendingImagesDiv = document.getElementById("adminPanel");

    pendingImagesDiv.innerHTML = ""; // clear privious content

    querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        console.log("data from firebase", data);

        if (data.status === "pending" &&data.imageUrl) {  // only show pending images
          console.log("URL saved in firebase",data.imageUrl);
            const div = document.createElement("div");
            div.innerHTML = `
                <img src="${data.imageUrl}" style="width: 100px; margin: 5px;">
                <p>Number: ${data.number}</p>
                <button onclick="approveImage('${doc.id}')">Approve</button>
                <button onclick="deleteImage('${doc.id}')">Reject</button>
            `;
            pendingImagesDiv.appendChild(div);
        } else {
          console.warn("Skipping document (missing imageUrl):",data);
        }
    });
}

// function to approve an image
async function approveImage(imageId) {
    const imageRef = doc(db, "numbers", imageId);
    try {
        await updateDoc(imageRef, { status: "approved" });  // 🔵 ステータス変更
        console.log("Image appeoved!");
        alert("Image has been approved!");
        displayPendingImages(); // refresh pending list
    } catch (error) {
        console.error("Error approving image:", error);
    }
}

// Function to delete an image
async function deleteImage(imageId) {
    try {
        await deleteDoc(doc(db, "numbers", imageId));
        console.log("🗑️ 画像を削除しました！");
        alert("画像を削除しました！");
        displayPendingImages(); // refresh pending list
    } catch (error) {
        console.error("error deleting image:", error);
    }
}




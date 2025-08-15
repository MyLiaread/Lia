// Initialisation Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDpaf3wdXkypPKH443SIZcJRFiz02s-t30",
  authDomain: "liaread.firebaseapp.com",
  projectId: "liaread",
  storageBucket: "liaread.firebasestorage.app",
  messagingSenderId: "951394019167",
  appId: "1:951394019167:web:86825d5ebff4d77807f8ea",
  measurementId: "G-63JN91LVV6"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ========================
// Création de compte auteur
// ========================
const signupForm = document.getElementById('signupForm');
if(signupForm){
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        alert("Compte auteur créé avec succès !");
        window.location.href = "login.html";
      })
      .catch((error) => {
        alert("Erreur : " + error.message);
      });
  });
}

// ========================
// Connexion auteur
// ========================
const loginForm = document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        window.location.href = "dashboard.html";
      })
      .catch((error) => {
        alert("Erreur : " + error.message);
      });
  });
}

// ========================
// Déconnexion auteur
// ========================
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn){
  logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
      window.location.href = "index.html";
    });
  });
}

// ========================
// Soumission de livres
// ========================
const submitBookForm = document.getElementById('submitBookForm');
if(submitBookForm){
  submitBookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('bookTitle').value;
    const price = document.getElementById('bookPrice').value;
    const category = document.getElementById('bookCategory').value;
    const file = document.getElementById('bookFile').files[0];
    const cover = document.getElementById('bookCover').files[0];
    const author = auth.currentUser.email;

    try {
      const fileRef = storage.ref('books/' + file.name);
      const coverRef = storage.ref('covers/' + cover.name);

      await fileRef.put(file);
      await coverRef.put(cover);

      const fileURL = await fileRef.getDownloadURL();
      const coverURL = await coverRef.getDownloadURL();

      await db.collection('books').add({
        title,
        price,
        category,
        author,
        fileURL,
        coverURL,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        views: 0,
        purchases: 0
      });

      alert("Livre soumis avec succès !");
      submitBookForm.reset();
    } catch (err) {
      alert("Erreur lors de la soumission : " + err.message);
    }
  });
}

// ========================
// Affichage livres sur index
// ========================
function displayBooks() {
  const booksContainer = document.getElementById('booksContainer');
  if(!booksContainer) return;

  db.collection('books').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
    booksContainer.innerHTML = '';
    snapshot.forEach(doc => {
      const book = doc.data();
      booksContainer.innerHTML += `
        <div class="book-card">
          <img src="${book.coverURL}" alt="${book.title}">
          <h3>${book.title}</h3>
          <p>Auteur : ${book.author}</p>
          <p>Prix : ${book.price} F</p>
          <button class="payBtn" data-title="${book.title}" data-price="${book.price}">Payer maintenant</button>
        </div>
      `;
    });

    initFedapayButtons();
  });
}

// ========================
// Boutons Fedapay
// ========================
function initFedapayButtons() {
  const payButtons = document.querySelectorAll('.payBtn');
  payButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-title');
      const price = btn.getAttribute('data-price');

      // Configuration Fedapay Checkout
      const checkout = new FedaPayCheckout({
        publicKey: 'pk_live_VTI5GzvTTu2XkwNZybaVi2v4',
        currency: 'XOF',
        amount: price,
        transactionDesc: title,
        customerEmail: '',
        onSuccess: () => { window.location.href = 'succes.html'; },
        onFailure: () => { window.location.href = 'index.html'; }
      });
      checkout.open();
    });
  });
}

// ========================
// Initialisation
// ========================
window.addEventListener('DOMContentLoaded', () => {
  displayBooks();
});

const API = 'https://gallerybackend-hq0r.onrender.com';

const gallery = document.getElementById('gallery');
const uploadForm = document.getElementById('uploadForm');
const imageInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const toast = document.getElementById('toast');
const spinner = document.getElementById('spinner');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.close-btn');
const deleteBtn = document.getElementById('delete-btn');
const leftBtn = document.querySelector('.nav-btn.left');
const rightBtn = document.querySelector('.nav-btn.right');
const imageCounter = document.getElementById('image-counter');
const mobileDeleteBtn = document.getElementById('mobile-delete-btn');
const mobileCloseBtn = document.getElementById('mobile-close-btn');

let images = [];
let currentIndex = 0;

const isMobile = window.innerWidth <= 768;
mobileDeleteBtn.style.display = isMobile ? 'block' : 'none';
mobileCloseBtn.style.display = isMobile ? 'block' : 'none';

function showToast(msg) {
  toast.innerText = msg;
  toast.style.display = 'block';
  setTimeout(() => (toast.style.display = 'none'), 2500);
}

function showSpinner(show) {
  spinner.style.display = show ? 'block' : 'none';
}

function loadGallery() {
  showSpinner(true);
  fetch(`${API}/images`)
    .then(res => res.json())
    .then(data => {
      images = data;
      gallery.innerHTML = '';
      data.forEach((img, idx) => {
        const el = document.createElement('img');
        el.src = img.url;
        el.classList.add('fade-in');
        el.dataset.id = img._id;
        el.dataset.index = idx;
        el.addEventListener('click', () => openLightbox(idx));
        gallery.appendChild(el);
      });
    })
    .catch(() => showToast('Failed to load images'))
    .finally(() => showSpinner(false));
}

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const files = imageInput.files;
  if (!files.length) return;

  showSpinner(true);
  try {
    const uploaded = [];
    for (let file of files) {
      const formData = new FormData();
      formData.append('images', file); // ✅ matches backend multer field name
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      uploaded.push(...result);
    }
    images = [...images, ...uploaded];
    loadGallery();
    showToast('Images uploaded!');
    uploadForm.reset();
    previewContainer.innerHTML = '';
  } catch (err) {
    showToast('Upload failed');
    console.error(err);
  } finally {
    showSpinner(false);
  }
});

imageInput.addEventListener('change', () => {
  previewContainer.innerHTML = '';
  Array.from(imageInput.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement('img');
      img.src = reader.result;
      previewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});


function openLightbox(index) {
  currentIndex = index;
  lightboxImg.src = images[index].url;
  imageCounter.innerText = `${index + 1} / ${images.length}`;
  lightbox.classList.add('active'); // ✅ use class instead of setting display directly
}

function closeLightbox() {
  lightbox.classList.remove('active'); // ✅ cleaner than display = 'none'
}

function deleteCurrentImage() {
  const image = images[currentIndex];
  if (!image || !image._id) return;
  showSpinner(true);
  fetch(`${API}/images/${image._id}`, {
    method: 'DELETE',
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed');
      return res.json();
    })
    .then(() => {
      showToast('Image deleted');
      closeLightbox();
      loadGallery();
    })
    .catch(() => showToast('Delete failed'))
    .finally(() => showSpinner(false));
}

// Navigation + UI Events
closeBtn.addEventListener('click', closeLightbox);
mobileCloseBtn.addEventListener('click', closeLightbox);
deleteBtn.addEventListener('click', deleteCurrentImage);
mobileDeleteBtn.addEventListener('click', deleteCurrentImage);

leftBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  openLightbox(currentIndex);
});

rightBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % images.length;
  openLightbox(currentIndex);
});

// Keyboard nav
window.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'ArrowLeft') leftBtn.click();
  if (e.key === 'ArrowRight') rightBtn.click();
  if (e.key === 'Escape') closeLightbox();
});

// Touch swipe nav
let touchStartX = 0;
lightbox.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});
lightbox.addEventListener('touchend', (e) => {
  const delta = touchStartX - e.changedTouches[0].clientX;
  if (delta > 50) rightBtn.click();
  if (delta < -50) leftBtn.click();
});

// Start by loading the gallery
loadGallery();


    const toggleBtn = document.getElementById('toggle-btn');
    const navLinks = document.getElementById('navbar-links');
  
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  

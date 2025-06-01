document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded: Đang tải danh sách bài viết...');
  // Lấy danh sách bài viết từ API
  loadPosts();
});

// Hàm lấy và hiển thị bài viết
function loadPosts() {
    console.log('loadPosts: Gửi yêu cầu đến /get_posts...');
    fetch('http://localhost:5000/get_posts')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(posts => {
            console.log('loadPosts: Dữ liệu bài viết từ API:', posts);
            const postsDiv = document.querySelector('#postsContainer');
            if (!postsDiv) {
                console.error('loadPosts: Không tìm thấy #postsContainer!');
                return;
            }
            postsDiv.innerHTML = '';
            if (!posts || posts.length === 0) {
                console.log('loadPosts: Không có bài viết.');
                postsDiv.innerHTML = '<p>Chưa có bài viết nào.</p>';
                return;
            }
            posts.forEach(post => {
                console.log('loadPosts: Hiển thị bài viết:', post);
                const postElement = document.createElement('div');
                postElement.classList.add('card', 'mb-3');
                let postContent = `
                    <div class="card-body">
                        <p><strong>Người dùng: ${post.user_id}</strong></p>
                        <p>${post.content || 'Không có nội dung'}</p>`;
                if (post.image) {
                    postContent += `<img src="${post.image}" class="img-fluid mt-2" alt="Post image">`;
                }
                postContent += `
                        <small>${new Date(post.timestamp).toLocaleString()}</small>
                    </div>`;
                postElement.innerHTML = postContent;
                postsDiv.appendChild(postElement);
            });
        })
        .catch(error => {
            console.error('Lỗi khi lấy bài viết:', error);
        });
  }

// Hàm xử lý tạo bài viết
function createPost() {
  const text = document.getElementById('postText').value.trim();
  const imageInput = document.getElementById('postImage');
  let imageData = null;

  console.log('createPost: Nội dung:', text, 'Số file ảnh:', imageInput.files.length);

  // Kiểm tra xem có nội dung hoặc ảnh không
  if (!text && !imageInput.files.length) {
      alert('Vui lòng nhập nội dung hoặc chọn ảnh!');
      return;
  }

  // Xử lý bài viết
  const processPost = () => {
      const postData = {
          user_id: '7ee3ce639d45', // Giả lập user_id (có thể lấy từ phiên đăng nhập)
          content: text,
          image: imageData, // Dữ liệu ảnh dạng base64 (nếu có)
          timestamp: new Date().toISOString()
      };

      console.log('createPost: Gửi dữ liệu bài viết đến /save_post:', postData);

      // Gửi bài viết lên server
      fetch('http://localhost:5000/save_post', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
      })
          .then(response => {
              if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
          })
          .then(result => {
              console.log('createPost: Phản hồi từ /save_post:', result);
              if (result.status === 'success') {
                  // Reset form
                  document.getElementById('postText').value = '';
                  imageInput.value = '';
                  console.log('createPost: Đã lưu bài viết thành công, tải lại danh sách...');
                  // Tải lại danh sách bài viết
                  loadPosts();
              } else {
                  console.error('createPost: Lưu bài viết thất bại, phản hồi không có status "success".');
                  alert('Lưu bài viết thất bại. Vui lòng thử lại!');
              }
          })
          .catch(error => {
              console.error('Lỗi khi lưu bài viết:', error.message);
              alert('Có lỗi xảy ra khi lưu bài viết: ' + error.message);
          });
  };

  // Nếu có ảnh, đọc file và chuyển thành base64
  if (imageInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = function(e) {
          imageData = e.target.result; // Lưu dữ liệu ảnh dạng base64
          console.log('createPost: Đã đọc ảnh thành base64:', imageData.substring(0, 50) + '...');
          processPost();
      };
      reader.onerror = function() {
          console.error('createPost: Lỗi khi đọc file ảnh!');
          alert('Không thể đọc file ảnh. Vui lòng thử lại!');
      };
      reader.readAsDataURL(imageInput.files[0]);
  } else {
      processPost();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded: Đang tải danh sách bài viết...');
  loadPosts();
});
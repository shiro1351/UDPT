from flask import Flask, jsonify, request
from happybase import Connection

app = Flask(__name__)

# Kết nối với HBase
connection = Connection(host='localhost', port=9090)  # Điều chỉnh host/port nếu cần
connection.open()

# Truy cập bảng 'posts' trong HBase
posts_table = connection.table('posts')

# API để lấy danh sách bài viết
@app.route('/get_posts', methods=['GET'])
def get_posts():
    posts = []
    for key, data in posts_table.scan():
        post = {
            'post_id': key.decode('utf-8'),
            'user_id': data[b'details:user_id'].decode('utf-8'),
            'content': data[b'details:content'].decode('utf-8'),
            'timestamp': data[b'details:timestamp'].decode('utf-8') + '.000Z'  # Thêm .000Z
        }
        if b'details:image' in data:
            post['image'] = data[b'details:image'].decode('utf-8')
        posts.append(post)
    return jsonify(posts)

# API để lưu bài viết mới
@app.route('/save_post', methods=['POST'])
def save_post():
    data = request.get_json()
    post_id = str(int(data['timestamp'].replace('-', '').replace(':', '').replace('T', '').replace('.', '')))
    post_data = {
        b'details:user_id': data['user_id'].encode('utf-8'),
        b'details:content': data['content'].encode('utf-8'),
        b'details:timestamp': data['timestamp'].encode('utf-8')
    }
    # Thêm dữ liệu ảnh nếu có
    if 'image' in data and data['image']:
        post_data[b'details:image'] = data['image'].encode('utf-8')
    
    posts_table.put(post_id, post_data)
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
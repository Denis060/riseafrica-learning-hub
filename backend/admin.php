<?php
// FILE: backend/admin.php
// This is the upgraded version with automatic YouTube URL conversion and a live preview.

include_once './config/database.php';

$database = new Database();
$db = $database->getConnection();

$message = '';
$error = '';

// --- Helper function to convert YouTube URLs ---
function convertToEmbedURL($url) {
    $url = trim($url);
    // Standard watch link: https://www.youtube.com/watch?v=VIDEO_ID
    if (preg_match('/watch\?v=([a-zA-Z0-9_-]+)/', $url, $matches)) {
        return 'https://www.youtube.com/embed/' . $matches[1];
    }
    // Shortened youtu.be link: https://youtu.be/VIDEO_ID
    if (preg_match('/youtu\.be\/([a-zA-Z0-9_-]+)/', $url, $matches)) {
        return 'https://www.youtube.com/embed/' . $matches[1];
    }
    // Already an embed link
    if (strpos($url, 'youtube.com/embed') !== false) {
        return $url;
    }
    // Return original URL if no match is found
    return $url;
}


// --- Handle Form Submissions ---

// 1. Create a new Course
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['create_course'])) {
    try {
        $query = "INSERT INTO courses (title, instructor, description, image_url) VALUES (:title, :instructor, :description, :image_url)";
        $stmt = $db->prepare($query);
        $stmt->bindValue(':title', trim($_POST['course_title']));
        $stmt->bindValue(':instructor', trim($_POST['course_instructor']));
        $stmt->bindValue(':description', trim($_POST['course_description']));
        $stmt->bindValue(':image_url', trim($_POST['course_image_url']));
        if ($stmt->execute()) {
            $message = "New course created successfully!";
        } else {
            $error = "Failed to create course.";
        }
    } catch (PDOException $e) {
        $error = "Database Error: " . $e->getMessage();
    }
}

// 2. Create a new Module
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['create_module'])) {
     try {
        $query = "INSERT INTO modules (course_id, title, module_order) VALUES (:course_id, :title, :module_order)";
        $stmt = $db->prepare($query);
        $stmt->bindValue(':course_id', $_POST['module_course_id']);
        $stmt->bindValue(':title', trim($_POST['module_title']));
        $stmt->bindValue(':module_order', $_POST['module_order']);
        if ($stmt->execute()) {
            $message = "New module added successfully!";
        } else {
            $error = "Failed to add module.";
        }
    } catch (PDOException $e) {
        $error = "Database Error: " . $e->getMessage();
    }
}

// 3. Create a new Lesson
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['create_lesson'])) {
    try {
        $query = "INSERT INTO lessons (course_id, module_id, title, lesson_type, content, lesson_order) VALUES (:course_id, :module_id, :title, :lesson_type, :content, :lesson_order)";
        $stmt = $db->prepare($query);
        
        $lesson_type = trim($_POST['lesson_type']);
        $content = trim($_POST['lesson_content']);

        // Automatically convert video URL if the type is video
        if ($lesson_type === 'video') {
            $content = convertToEmbedURL($content);
        }

        $stmt->bindValue(':course_id', $_POST['lesson_course_id']);
        $stmt->bindValue(':module_id', $_POST['lesson_module_id']);
        $stmt->bindValue(':title', trim($_POST['lesson_title']));
        $stmt->bindValue(':lesson_type', $lesson_type);
        $stmt->bindValue(':content', $content);
        $stmt->bindValue(':lesson_order', $_POST['lesson_order']);

        if ($stmt->execute()) {
            $message = "New lesson added successfully!";
        } else {
            $error = "Failed to add lesson.";
        }
    } catch (PDOException $e) {
        $error = "Database Error: " . $e->getMessage();
    }
}


// --- Fetch data for dropdowns ---
$courses = $db->query("SELECT id, title FROM courses ORDER BY title ASC")->fetchAll(PDO::FETCH_ASSOC);
$modules = $db->query("SELECT modules.id, modules.title, courses.title as course_title FROM modules JOIN courses ON modules.course_id = courses.id ORDER BY courses.title, modules.module_order ASC")->fetchAll(PDO::FETCH_ASSOC);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RiseAfrica Hub - Admin Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: sans-serif; background-color: #f0f2f5; }
        .container { max-width: 800px; margin: 2rem auto; }
        .form-section { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .form-section h2 { font-size: 1.5rem; font-weight: bold; margin-bottom: 1.5rem; color: #0A2463; }
        label { display: block; font-weight: bold; margin-bottom: 0.5rem; color: #333; }
        input, select, textarea { width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem; }
        button { background-color: #0A2463; color: white; font-weight: bold; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; transition: background-color 0.3s; }
        button:hover { background-color: #081e4f; }
        .message { padding: 1rem; border-radius: 4px; margin-bottom: 1rem; }
        .success { background-color: #d4edda; color: #155724; }
        .error { background-color: #f8d7da; color: #721c24; }
    </style>
</head>
<body>

<div class="container">
    <h1 class="text-4xl font-bold text-center mb-8" style="color: #0A2463;">RiseAfrica Hub - Content Management</h1>

    <?php if ($message): ?>
        <div class="message success"><?php echo htmlspecialchars($message); ?></div>
    <?php endif; ?>
    <?php if ($error): ?>
        <div class="message error"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>

    <!-- Section 1: Create Course -->
    <div class="form-section">
        <h2>Create New Course</h2>
        <form method="POST">
            <input type="hidden" name="create_course" value="1">
            <label for="course_title">Course Title</label>
            <input type="text" name="course_title" id="course_title" required>
            <label for="course_instructor">Instructor</label>
            <input type="text" name="course_instructor" id="course_instructor" required>
            <label for="course_description">Description</label>
            <textarea name="course_description" id="course_description" rows="4" required></textarea>
            <label for="course_image_url">Image URL</label>
            <input type="text" name="course_image_url" id="course_image_url" placeholder="e.g., https://placehold.co/600x400/...">
            <button type="submit">Create Course</button>
        </form>
    </div>

    <!-- Section 2: Create Module -->
    <div class="form-section">
        <h2>Create New Module</h2>
        <form method="POST">
            <input type="hidden" name="create_module" value="1">
            <label for="module_course_id">Select Course</label>
            <select name="module_course_id" id="module_course_id" required>
                <option value="">-- Choose a Course --</option>
                <?php foreach ($courses as $course): ?>
                    <option value="<?php echo $course['id']; ?>"><?php echo htmlspecialchars($course['title']); ?></option>
                <?php endforeach; ?>
            </select>
            <label for="module_title">Module Title</label>
            <input type="text" name="module_title" id="module_title" placeholder="e.g., 1. Introduction to AI" required>
            <label for="module_order">Module Order</label>
            <input type="number" name="module_order" id="module_order" value="1" required>
            <button type="submit">Create Module</button>
        </form>
    </div>

    <!-- Section 3: Create Lesson -->
    <div class="form-section">
        <h2>Create New Lesson</h2>
        <form method="POST">
            <input type="hidden" name="create_lesson" value="1">
            <label for="lesson_course_id">Select Course</label>
             <select name="lesson_course_id" id="lesson_course_id" required>
                <option value="">-- Choose a Course --</option>
                <?php foreach ($courses as $course): ?>
                    <option value="<?php echo $course['id']; ?>"><?php echo htmlspecialchars($course['title']); ?></option>
                <?php endforeach; ?>
            </select>
            <label for="lesson_module_id">Select Module</label>
            <select name="lesson_module_id" id="lesson_module_id" required>
                 <option value="">-- Choose a Module --</option>
                <?php foreach ($modules as $module): ?>
                    <option value="<?php echo $module['id']; ?>"><?php echo htmlspecialchars($module['course_title'] . ' -> ' . $module['title']); ?></option>
                <?php endforeach; ?>
            </select>
            <label for="lesson_title">Lesson Title</label>
            <input type="text" name="lesson_title" id="lesson_title" placeholder="e.g., What is a Neural Network?" required>
            <label for="lesson_order">Lesson Order</label>
            <input type="number" name="lesson_order" id="lesson_order" value="1" required>
            <label for="lesson_type">Lesson Type</label>
            <select name="lesson_type" id="lesson_type" required>
                <option value="video">Video</option>
                <option value="text">Text</option>
                <option value="quiz">Quiz</option>
            </select>
            <label for="lesson_content">Content</label>
            <textarea name="lesson_content" id="lesson_content" rows="5" placeholder="For Video: Any YouTube URL. For Text: The lesson text. For Quiz: The JSON structure." required></textarea>
            
            <iframe id="youtubePreview" class="w-full mt-4 rounded hidden" style="height: 300px;" frameborder="0" allowfullscreen></iframe>
            
            <button type="submit">Create Lesson</button>
        </form>
    </div>

</div>

<script>
    document.getElementById('lesson_content').addEventListener('input', function () {
        const type = document.getElementById('lesson_type').value;
        const content = this.value.trim();
        const preview = document.getElementById('youtubePreview');

        if (type === 'video') {
            let embedUrl = '';
            // Match standard watch link
            let match = content.match(/watch\?v=([a-zA-Z0-9_-]+)/);
            if (match) {
                embedUrl = 'https://www.youtube.com/embed/' + match[1];
            }
            // Match youtu.be short link
            match = content.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
            if (match) {
                embedUrl = 'https://www.youtube.com/embed/' + match[1];
            }

            if (embedUrl) {
                preview.src = embedUrl;
                preview.classList.remove('hidden');
            } else {
                preview.classList.add('hidden');
            }
        } else {
            preview.classList.add('hidden');
        }
    });

    // Hide preview if type is not video
    document.getElementById('lesson_type').addEventListener('change', function() {
        if (this.value !== 'video') {
            document.getElementById('youtubePreview').classList.add('hidden');
        }
    });
</script>

</body>
</html>

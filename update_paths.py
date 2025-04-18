import os
from pathlib import Path

def update_paths_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Get the directory of the current file
    file_dir = Path(file_path).parent
    
    # Calculate relative paths
    scripts_path = os.path.relpath('scripts', file_dir)
    styles_path = os.path.relpath('styles', file_dir)
    
    # Replace absolute paths with relative paths
    content = content.replace('src="/smartui/scripts/', f'src="{scripts_path}/')
    content = content.replace('src="/smartui/styles/', f'src="{styles_path}/')
    content = content.replace('href="/smartui/scripts/', f'href="{scripts_path}/')
    content = content.replace('href="/smartui/styles/', f'href="{styles_path}/')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated paths in {file_path}")

def main():
    # Walk through all directories
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                update_paths_in_file(file_path)

if __name__ == '__main__':
    main() 
import os
import re

# Define the folders and their suffixes
folders = {
    'bronze': 'bronze',
    'silver': 'silver',
    'gold': 'gold'
}

# Regular expression to match background image references
pattern = r"background: url\('\.\./images/([^']*)\.png'\)"

# Process each folder
for folder, suffix in folders.items():
    print(f"Processing {folder} folder...")
    
    # Get all HTML files in the folder
    html_files = [f for f in os.listdir(folder) if f.endswith('.html')]
    
    for html_file in html_files:
        file_path = os.path.join(folder, html_file)
        
        # Read the file content
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Replace the background image reference
        updated_content = re.sub(
            pattern,
            f"background: url('../images/\\1{suffix}.png')",
            content
        )
        
        # Write the updated content back to the file
        with open(file_path, 'w') as f:
            f.write(updated_content)
        
        print(f"  Updated {html_file}")

print("All files have been updated successfully!") 
import os
import re
import glob

# Find all JSX files with hardcoded localhost URLs
src_dir = r'd:\DACN_HuynhNhatHuy_1050080136_THMT2\english-learning-app\src'
jsx_files = glob.glob(f'{src_dir}/**/*.jsx', recursive=True)

def has_getapi_import(content):
    """Check if file already has getApiUrl import"""
    return "getApiUrl" in content or "getApiBaseUrl" in content

def add_getapi_import(content):
    """Add getApiBaseUrl import if not present"""
    if has_getapi_import(content):
        return content
    
    # Add import after axios import
    if "import axios from 'axios';" in content:
        content = content.replace(
            "import axios from 'axios';",
            "import { getApiBaseUrl } from '../../utils/api';\nimport axios from 'axios';"
        )
    
    return content

def fix_localhost_urls(content):
    """Replace 'http://localhost:5000/api' with template variable"""
    
    # Simply replace the base URL string with a variable reference
    # From: 'http://localhost:5000/api/xxx' -> 'getApiBaseUrl()/xxx'
    # From: `http://localhost:5000/api/${...}` -> `${getApiBaseUrl()}/${...}`
    
    # Replace string literals
    content = re.sub(
        r"'http://localhost:5000/api/",
        r"getApiBaseUrl() + '/",
        content
    )
    
    # Replace template literals (backticks)
    content = re.sub(
        r"`http://localhost:5000/api/",
        r"`${getApiBaseUrl()}/",
        content
    )
    
    return content

# Process each file
fixed_count = 0
for file_path in jsx_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        original = f.read()
    
    if 'localhost:5000' not in original:
        continue
    
    content = original
    content = add_getapi_import(content)
    content = fix_localhost_urls(content)
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        file_name = os.path.basename(file_path)
        print(f"✓ Fixed: {file_name}")
        fixed_count += 1

print(f"\nTotal files fixed: {fixed_count}")



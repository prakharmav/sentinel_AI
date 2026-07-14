import os
import re

directories = [
    'c:/Users/ASUS/OneDrive/Desktop/win/frontend/app/analytics',
    'c:/Users/ASUS/OneDrive/Desktop/win/frontend/app/citizen',
    'c:/Users/ASUS/OneDrive/Desktop/win/frontend/app/network',
    'c:/Users/ASUS/OneDrive/Desktop/win/frontend/app/query'
]

for d in directories:
    html_file = os.path.join(d, 'code.html')
    tsx_file = os.path.join(d, 'page.tsx')
    
    if os.path.exists(html_file):
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        body_match = re.search(r'<body[^>]*>(.*)</body>', content, re.DOTALL | re.IGNORECASE)
        if body_match:
            body_content = body_match.group(1)
            
            # Remove scripts
            body_content = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', body_content, flags=re.IGNORECASE)
            
            # Convert attributes
            body_content = body_content.replace('class="', 'className="')
            body_content = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', body_content, flags=re.DOTALL)
            
            # Fix style tags
            body_content = body_content.replace('''style="font-variation-settings: 'FILL' 0;"''', "style={{fontVariationSettings: \"'FILL' 0\"}}")
            body_content = body_content.replace('''style="font-variation-settings: 'FILL' 1;"''', "style={{fontVariationSettings: \"'FILL' 1\"}}")
            body_content = body_content.replace('''style="animation-delay: 0.5s"''', "style={{animationDelay: '0.5s'}}")
            body_content = re.sub(r'''style="background-image:\s*url\('([^']+)'\)"''', r'''style={{backgroundImage: "url('\1')"}}''', body_content)
            body_content = re.sub(r'''style="box-shadow:\s*0 0 20px theme\('colors\.tertiary-container'\)"''', r'''style={{boxShadow: "0 0 20px theme('colors.tertiary-container')"}}''', body_content)
            
            tsx_content = f'''"use client";\n\nimport React, {{ useState, useEffect }} from 'react';\n\nexport default function Page() {{\n  return (\n    <>\n{body_content}\n    </>\n  );\n}}\n'''
            
            with open(tsx_file, 'w', encoding='utf-8') as f:
                f.write(tsx_content)
            print(f"Restored: {tsx_file}")

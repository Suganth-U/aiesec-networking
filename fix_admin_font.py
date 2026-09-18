import re

with open('src/app/admin/page.tsx', 'r') as f:
    text = f.read()

# 1. Login screen
text = text.replace(
    '<div className="flex-1 flex items-center justify-center p-4 bg-white text-zinc-900">',
    '<div className="flex-1 flex items-center justify-center p-4 bg-white text-zinc-900" style={{ fontFamily: \'system-ui, -apple-system, sans-serif\' }}>'
)

# 2. Loading screen
text = text.replace(
    '<div className="flex-1 flex items-center justify-center bg-white text-zinc-900">',
    '<div className="flex-1 flex items-center justify-center bg-white text-zinc-900" style={{ fontFamily: \'system-ui, -apple-system, sans-serif\' }}>'
)

# 3. Admin dashboard
text = text.replace(
    '<div className="flex-1 bg-white text-zinc-900 p-4 sm:p-8">',
    '<div className="flex-1 bg-white text-zinc-900 p-4 sm:p-8" style={{ fontFamily: \'system-ui, -apple-system, sans-serif\' }}>'
)

with open('src/app/admin/page.tsx', 'w') as f:
    f.write(text)

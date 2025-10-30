# Welcome Back Website

A simple, professional welcome page template for cadster.in

## Contents

- `index.html` - Main welcome page
- `style.css` - Styling and responsive design
- `.htaccess` - Server configuration (Apache)
- `README.md` - This file

## How to Deploy

### Option 1: Shared Hosting (Hostinger, Bluehost, etc.)
1. Extract this ZIP file
2. Connect via FTP or File Manager
3. Upload all files to the `public_html` directory
4. Visit https://cadster.in in your browser

### Option 2: VPS / Dedicated Server
1. SSH into your server
2. Extract files to your web root (usually `/var/www/html/` or `/home/username/public_html/`)
3. Set proper permissions: `chmod 755 -R *`
4. Ensure your web server (Apache/Nginx) is running
5. Visit https://cadster.in

### Option 3: Cloud Hosting (DigitalOcean, Linode, AWS)
1. Extract files locally
2. Use SCP or SFTP to transfer to your server
3. Configure your web server to serve these files
4. Set DNS A record to your server's IP

## Customization

- Edit `index.html` to change content
- Modify `style.css` for colors and fonts
- Replace the SVG logo with your own

## SSL/HTTPS

Your hosting provider should automatically provide an SSL certificate (usually free with Let's Encrypt). If not, request one in your hosting control panel.

## Support

For hosting-specific questions, contact your hosting provider's support.

## Next Steps After Deployment

1. Replace this template with your actual website
2. Set up custom email addresses
3. Configure analytics (Google Analytics, etc.)
4. Set up backups and security measures

Good luck! 🚀

# PWA Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Issue: "You have to be online" message in localhost

**Problem**: The PWA service worker is being too aggressive with offline handling, even in development.

**Solution**: ✅ **FIXED**
- Service worker is now disabled in development mode
- PWA features only activate in production builds
- Development mode indicator shows "DEV MODE" badge

### Issue: App not loading in development

**Symptoms**:
- Blank page or loading issues
- Console errors about service worker
- Offline messages when clearly online

**Solutions**:
1. **Clear browser cache and storage**:
   - Open DevTools (F12)
   - Go to Application tab
   - Clear Storage → Clear site data
   - Refresh the page

2. **Disable service worker in DevTools**:
   - DevTools → Application → Service Workers
   - Check "Bypass for network"
   - Unregister any existing service workers

3. **Use incognito/private browsing**:
   - Test in incognito mode to avoid cache issues

### Issue: PWA install prompt not showing

**Possible causes**:
- App already installed
- Not using HTTPS (required for PWA)
- Browser doesn't support PWA
- Manifest file issues

**Solutions**:
1. **Check manifest**:
   - Visit `/manifest.json` in browser
   - Verify all required fields are present

2. **Test in different browsers**:
   - Chrome/Edge: Best PWA support
   - Firefox: Good support
   - Safari: Limited support

3. **Use HTTPS**:
   - PWA features require HTTPS in production
   - localhost works for development

### Issue: Service worker not updating

**Problem**: Old service worker cached and not updating.

**Solutions**:
1. **Force update**:
   - DevTools → Application → Service Workers
   - Click "Update" or "Unregister"

2. **Hard refresh**:
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

3. **Clear cache**:
   - DevTools → Application → Storage
   - Clear site data

## 🔧 Development vs Production

### Development Mode (localhost)
- ✅ Service worker disabled
- ✅ PWA prompts disabled
- ✅ Normal web app behavior
- ✅ "DEV MODE" indicator visible

### Production Mode (HTTPS)
- ✅ Service worker enabled
- ✅ PWA install prompts
- ✅ Offline functionality
- ✅ App-like experience

## 🧪 Testing PWA Features

### Local Testing:
```bash
# Build for production
npm run build

# Serve production build
npm run preview

# Test at http://localhost:4173
```

### Production Testing:
1. Deploy to HTTPS hosting (Vercel, Netlify, etc.)
2. Test on mobile devices
3. Verify install prompts work
4. Test offline functionality

## 🛠️ Debug Tools

### Browser DevTools:
1. **Application Tab**:
   - Service Workers
   - Manifest
   - Storage

2. **Console**:
   - Look for PWA-related logs
   - Service worker registration messages

3. **Network Tab**:
   - Check if requests are served from cache
   - Verify offline behavior

### Lighthouse Audit:
1. Open DevTools
2. Go to Lighthouse tab
3. Run PWA audit
4. Fix any issues reported

## 📱 Browser-Specific Issues

### Chrome/Edge:
- ✅ Full PWA support
- Install prompts work well
- Good offline functionality

### Firefox:
- ✅ Good PWA support
- May need manual install
- Check about:config for PWA settings

### Safari:
- ⚠️ Limited PWA support
- No install prompts
- Basic offline functionality

### Mobile Browsers:
- ✅ Excellent PWA support
- "Add to Home Screen" option
- Native app-like experience

## 🔍 Common Console Messages

### Normal Messages:
```
PWA service worker disabled in development mode
Service Worker registered successfully
App is back online
```

### Warning Messages:
```
Backend is temporarily unavailable, will retry in 30 seconds
Using cached data for: /api/courses
```

### Error Messages:
```
Service Worker registration failed
Backend service is not available
```

## 🚀 Performance Tips

1. **Optimize bundle size**:
   - Use dynamic imports
   - Code splitting
   - Tree shaking

2. **Cache strategy**:
   - Cache static assets aggressively
   - Use network-first for API calls
   - Implement background sync

3. **Offline experience**:
   - Cache critical pages
   - Provide offline indicators
   - Queue actions for later sync

## 📞 Getting Help

If you're still experiencing issues:

1. **Check browser console** for error messages
2. **Test in incognito mode** to rule out cache issues
3. **Try different browsers** to isolate browser-specific problems
4. **Clear all browser data** for the site
5. **Test the production build** with `npm run build && npm run preview`

## 🔄 Reset Everything

If all else fails, completely reset the PWA:

```bash
# Stop development server
# Clear browser cache and storage
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart development
npm run dev
```

Then test in incognito mode to ensure a clean slate.

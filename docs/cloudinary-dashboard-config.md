## Cloudinary Security Settings

1. Upload Security
- [ ] Use signed upload flow for app uploads (no direct browser preset uploads)
- [ ] Upload preset (if used internally) is not exposed in client code
- [ ] Allowed formats: jpg,png,webp
- [ ] SVG disabled for user content
- [ ] Max file size: 5MB

2. Moderation
- [ ] Automatic moderation enabled (for example AWS Rekognition)
- [ ] Rejected assets reviewed and deleted/quarantined

3. Delivery Security
- [ ] Strict transformations enabled
- [ ] Dynamic transformation abuse prevented
- [ ] Backup enabled

4. Folder Policy
- [ ] Folder format: bhajans/{user_id}/{timestamp}_{filename}
- [ ] Separate folders for avatar/deity/lyrics if needed

5. Cost Controls
- [ ] Transformation quotas monitored
- [ ] Alert on sudden storage or bandwidth spikes

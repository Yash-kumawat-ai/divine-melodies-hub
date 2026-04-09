-- Allow all users (including anonymous) to view approved bhajans
CREATE POLICY "Allow viewing approved bhajans" ON user_uploads
  FOR SELECT USING (status = 'approved');

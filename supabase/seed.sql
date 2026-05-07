-- Seed data for development and staging
-- Run with: psql $DATABASE_URL -f seed.sql

-- Insert deities if not exist
INSERT INTO deities (id, name, name_hindi, slug, description, emoji) VALUES
(1, 'Krishna', 'कृष्ण', 'krishna', 'Lord of compassion, tenderness, and love', '🪈'),
(2, 'Shiva', 'शिव', 'shiva', 'The transformer and destroyer', '🔱'),
(3, 'Hanuman', 'हनुमान', 'hanuman', 'Symbol of strength and devotion', '🙏'),
(4, 'Rama', 'राम', 'rama', 'Ideal man and righteous king', '🏹'),
(5, 'Durga', 'दुर्गा', 'durga', 'Goddess of protection and strength', '🌺'),
(6, 'Ganesh', 'गणेश', 'ganesh', 'Remover of obstacles', '🐘'),
(7, 'Sai Baba', 'साईं बाबा', 'sai-baba', 'Saint of Shirdi', '✨'),
(8, 'Lakshmi', 'लक्ष्मी', 'lakshmi', 'Goddess of wealth and prosperity', '🪷'),
(9, 'Khatu Shyam', 'खाटू श्याम', 'khatu-shyam', 'The compassionate form of Barbarika', '🏇')
ON CONFLICT (id) DO NOTHING;

-- Sample bhajans for development
INSERT INTO bhajans (title, title_hindi, deity_id, singer_name, composer_name, lyrics_hindi, language, rating, play_count, status) VALUES
('Hare Krishna Mahamantra', 'हरे कृष्ण महामंत्र', 1, 'Jagjit Singh', 'Traditiona', 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे। हरे राम हरे राम राम राम हरे हरे।', 'Hindi', 4.9, 125000, 'approved'),
('Om Namah Shivaya', 'ॐ नमः शिवाय', 2, 'Anup Jalota', 'Traditional', 'ॐ नमः शिवाय नमः शिवाय नमः शिवाय। प्रणं प्रणं प्रणं प्रणं।', 'Sanskrit', 4.8, 98000, 'approved'),
('Hanuman Chalisa', 'हनुमान चालीसा', 3, 'Hariharan', 'Tulsi Das', 'श्री गुरु चरण सरोज रज निज मन मुकुरू सुधारी। लीनो हनुमान से बड़ी लीला करताई।', 'Hindi', 5.0, 210000, 'approved'),
('Ram Naam Ki Loot', 'राम नाम की लूट', 4, 'Mahendra Kapoor', 'Traditiona', 'राम नाम की लूट है लूट महारानी। जो ले नर कह ले जीवन मुक्तानी।', 'Hindi', 4.7, 87000, 'approved'),
('Jai Ambe Gauri', 'जै अम्बे गौरी', 5, 'Anuradha Paudwal', 'Traditional', 'जै अम्बे गौरी मैं जय गिरिराज। मन पर नंदी कृपा कर मोहे गिर कहत।', 'Hindi', 4.8, 76000, 'approved'),
('Vakratunda Mahakaya', 'वक्रतुण्ड महाकाय', 6, 'Sanjay Bansal', 'Traditional', 'वक्रतुण्ड महाकाय सूर्यकोटि प्रभाकार। निर्विघ्नं कुरु मे देव सर्वकार्य सुषूठय।', 'Sanskrit', 4.9, 65000, 'approved'),
('Sai Baba Ki Sai', 'साईं बाबा की साईं', 7, 'Ganesh', 'Sai', 'साईं बाबा तूना तो है आस। जो ध्यावे वो हर पावे मन का आस।', 'Hindi', 4.8, 92000, 'approved'),
('Om Jai Laxmi Mata', 'ॐ जै लक्ष्मी माता', 8, 'Madhuri Bhadur', 'Traditional', 'ॐ जै लक्ष्मी माता मैं जय लक्ष्मी माता। दुर्गा पाव धन धान्य सुख सौभाग्य माता।', 'Hindi', 4.7, 58000, 'approved'),
('Barsane Wali Radhe', 'बरसाने वाली राधे', 1, 'Radhe', 'Traditional', 'बरसाने वाली राधे, मोहे बरसना रे। तेरा दर्शन पावके जीवन हों पूरे।', 'Hindi', 4.8, 110000, 'approved'),
('Shiv Tandav Stotram', 'शिव तांडव स्तोत्रम', 2, 'Ajay Atul', 'Raghuvar Das', 'जटा-टूट पिंगल देव कराला। मुखं कुलैक वृष्टदली-दर्भ-हरालाम्।', 'Sanskrit', 4.9, 73000, 'approved'),
('Aarti Keejeay Hanuman Lala Ki', 'आरती कीजै हनुमान लला की', 3, 'Durga', 'Traditional', 'आरती कीजै हनुमान लला की। जीभ से भक्ति करो हनुमान लला की।', 'Hindi', 4.9, 88000, 'approved'),
('Raghupati Raghav Raja Ram', 'रघुपति राघव राजा राम', 4, 'Manna Dey', 'Traditional', 'रघुपति राघव राजा राम, पतित पावन राम। जग मोहन राम राम, सीता सोहन राम।', 'Hindi', 4.8, 64000, 'approved'),
('Jai Jagdish Hare', 'जै जगदीश हरे', 8, 'Anup Jalota', 'Traditiona', 'जै जगदीश हरे, स्वामी जै जगदीश हरे। पूरण सुख दायक, मोहे दीजै आस।', 'Hindi', 4.7, 91000, 'approved'),
('Ganesh Aarti', 'गणेश आरति', 6, 'Aditi Singh', 'Traditional', 'जै गणेश गिरिराज मोई। लता लिए सुनो सौं सहाय।', 'Hindi', 4.8, 102000, 'approved'),
('Mere Girdhar Krishna Murari', 'मेरे गिरधारी कृष्ण मुरारी', 1, 'Shankar Mahadevan', 'Traditional', 'मेरे गिरधारी कृष्ण मुरारी। नित नव नेहरूत प्रीति मेरी बढ़ाई।', 'Hindi', 4.9, 79000, 'approved'),
('Namo Namo Durge Sukh Karani', 'नमो नमो दुर्गे सुख करनी', 5, 'Richa Sharma', 'Traditional', 'नमो नमो दुर्गे सुख करनी। रत्न विद्या सुख धन देने वाली।', 'Hindi', 4.7, 54000, 'approved'),
('Sai Baba Mhane', 'साईं बाबा म्हणे', 7, 'Shruti', 'Sai', 'साईं बाबा म्हणे बाबा साईं। जो म्हणे तो पावे मोती साईं।', 'Marathi', 4.8, 68000, 'approved'),
('Shiv Bhakti Geet', 'शिव भक्ति गीत', 2, 'Udit Narayan', 'Traditional', 'शिव शिव महादेवा, तू सर्वेश्वर देवा। अनंत नित शिव भक्ति करूं सेवा।', 'Hindi', 4.6, 45000, 'approved'),
('Radhe Radhe', 'राधे राधे', 1, 'Radhe', 'Radhe', 'राधे राधे बोलो मन से, कृष्ण मिलेंगे कानों से। प्रेम भक्ति की राह में, नंद लाठा चलो।', 'Hindi', 4.9, 156000, 'approved'),
('Jayanti Mangala Kali', 'जयंती मंगला काली', 5, 'Kavita Seth', 'Traditional', 'जयंती मंगला काली, दुर्गा माई नमो नमो। भय भी हरो माई, अपने भक्तों को सदा बचाओ।', 'Hindi', 4.8, 63000, 'approved')
ON CONFLICT DO NOTHING;
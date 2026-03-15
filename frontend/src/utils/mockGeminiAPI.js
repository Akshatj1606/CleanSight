// Mock Gemini API for development
// In production, you'd want to use a proper backend service

import axios from 'axios';

const mockResponses = [
  "## Quick Recycling Tips ♻️\n\n• **Plastic bottles**: Clean & recycle\n• **Glass**: Reuse or recycle\n• **Paper**: Keep dry, then recycle\n\n🌱 **Reduce → Reuse → Recycle**",
  
  "## Safe Disposal 🗑️\n\n• **E-waste**: Specialized centers only\n• **Batteries**: Designated recycling points\n• **Organic**: Home compost or organic bins\n\n⚠️ **Never mix with regular trash**",
  
  "## Reuse Ideas �\n\n• **Containers**: Storage & organization\n• **Cardboard**: DIY projects\n• **Glass jars**: Food storage\n\n🎨 **Get creative, extend life!**"
];

// Function to call real Gemini API
const callRealGeminiAPI = async (contents) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key not configured');
  }

  try {
    const response = await axios.post(
      // 
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      { contents },
      { headers: { "Content-Type": "application/json" } }
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response from CleanSight AI.";
    return reply;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

export const callMockGeminiAPI = async (contents) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Return a random mock response
  const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  
  // Check if user is asking about specific topics
  const userText = contents[0]?.parts?.find(part => part.text)?.text?.toLowerCase() || '';
  
  if (userText.includes('plastic')) {
    return "## Plastic Recycling ♻️\n\n• **Check code** (1-7 on bottom)\n• **Clean first**, then recycle\n• **Remove caps/labels**\n• **Avoid single-use** when possible\n\n🌊 **Every bottle counts!**";
  }
  
  if (userText.includes('electronic') || userText.includes('e-waste')) {
    return "## E-Waste ⚠️\n\n• **Never regular trash**\n• **Find certified centers**\n• **Wipe data first**\n• **Donate if functional**\n\n🔋 **Components are recoverable!**";
  }
  
  if (userText.includes('organic') || userText.includes('food')) {
    return "## Organic Waste 🌱\n\n• **Home compost** = nutrient-rich soil\n• **Separate organic bins**\n• **Plan meals** to reduce waste\n• **Feed appropriate scraps** to garden\n\n🌿 **Makes excellent fertilizer!**";
  }

  if (userText.includes('glass')) {
    return "## Glass Recycling 🫙\n\n• **Clean thoroughly**\n• **Sort by color** if required\n• **Remove lids/labels**\n• **Reuse jars** for storage\n\n✨ **100% recyclable forever!**";
  }

  if (userText.includes('paper') || userText.includes('cardboard')) {
    return "## Paper & Cardboard 📄\n\n• **Keep dry and clean**\n• **Remove plastic windows**\n• **Flatten boxes**\n• **No wax-coated paper**\n\n🌳 **1 ton recycled = 17 trees saved!**";
  }

  if (userText.includes('metal') || userText.includes('aluminum') || userText.includes('can')) {
    return "## Metal Recycling 🥫\n\n• **Aluminum cans** = most valuable\n• **Clean steel cans**\n• **Scrap metal** to specialized centers\n• **Remove labels** when possible\n\n⚡ **95% less energy than new aluminum!**";
  }
  
  return randomResponse;
};

// Export a function that mimics axios.post
export const mockApiCall = {
  post: async (url, data) => {
    if (url.includes('/api/gemini')) {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // Try to use real API if key is configured
      if (apiKey ) {
        try {
          const reply = await callRealGeminiAPI(data.contents);
          return { data: { reply } };
        } catch (error) {
          console.warn('Falling back to mock API due to error:', error.message);
        }
      }
      
      // Use mock API as fallback
      const reply = await callMockGeminiAPI(data.contents);
      return { data: { reply } };
    }
    throw new Error('API endpoint not found');
  }
};

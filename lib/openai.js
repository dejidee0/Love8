import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false // Only use on server-side
})

// AI trait suggestions based on user profile
export const generateTraitSuggestions = async (userProfile, existingTraits = []) => {
  try {
    const prompt = `
    Based on this user profile, suggest 5 unique personality traits that would fit them well.
    
    User Profile:
    - Bio: ${userProfile.bio || 'No bio provided'}
    - Existing traits: ${existingTraits.join(', ') || 'None'}
    
    Requirements:
    - Each trait should be ONE WORD only
    - Traits should be positive and meaningful
    - Avoid duplicating existing traits
    - Focus on personality, skills, or character qualities
    - Make them diverse and interesting
    
    Return only a JSON array of trait words, nothing else.
    Example: ["Creative", "Empathetic", "Adventurous", "Analytical", "Optimistic"]
    `

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a personality expert who suggests meaningful one-word traits for social profiles. Always return valid JSON arrays."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    })

    const suggestions = JSON.parse(response.choices[0].message.content)
    return { success: true, traits: suggestions }
  } catch (error) {
    console.error('Error generating trait suggestions:', error)
    return { 
      success: false, 
      error: error.message,
      traits: ["Creative", "Kind", "Smart", "Funny", "Loyal"] // Fallback traits
    }
  }
}

// Generate trait descriptions
export const generateTraitDescription = async (traitWord, userContext = '') => {
  try {
    const prompt = `
    Create a short, engaging description (max 20 words) for the personality trait "${traitWord}".
    ${userContext ? `Context: ${userContext}` : ''}
    
    Make it:
    - Personal and relatable
    - Positive and inspiring
    - Something that would make someone proud to have this trait
    
    Return only the description text, no quotes or extra formatting.
    `

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a creative writer who crafts inspiring personality trait descriptions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 50,
      temperature: 0.8
    })

    return {
      success: true,
      description: response.choices[0].message.content.trim()
    }
  } catch (error) {
    console.error('Error generating trait description:', error)
    return {
      success: false,
      error: error.message,
      description: `Someone who embodies ${traitWord} in everything they do.`
    }
  }
}

// Generate social media captions for trait sharing
export const generateTraitCaption = async (traitWord, userName) => {
  try {
    const prompt = `
    Create an engaging social media caption for sharing a personality trait.
    
    Details:
    - Trait: ${traitWord}
    - User: ${userName}
    
    Make it:
    - Fun and shareable
    - Include relevant emojis
    - Encourage engagement
    - Keep it under 100 characters
    - Include #Love8 hashtag
    
    Return only the caption text.
    `

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a social media expert who creates viral, engaging captions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 60,
      temperature: 0.9
    })

    return {
      success: true,
      caption: response.choices[0].message.content.trim()
    }
  } catch (error) {
    console.error('Error generating caption:', error)
    return {
      success: false,
      error: error.message,
      caption: `Just got called ${traitWord} on Love8! ✨ What trait defines you? #Love8`
    }
  }
}

// Analyze trait compatibility for bestie matching
export const analyzeTraitCompatibility = async (user1Traits, user2Traits) => {
  try {
    const prompt = `
    Analyze the compatibility between two people based on their personality traits.
    
    Person 1 traits: ${user1Traits.join(', ')}
    Person 2 traits: ${user2Traits.join(', ')}
    
    Provide:
    1. Compatibility score (0-100)
    2. Shared traits or complementary qualities
    3. One sentence explaining why they'd be great besties
    
    Return as JSON:
    {
      "score": 85,
      "commonalities": ["Both are creative", "Complementary social styles"],
      "reason": "Your creative energies and balanced social styles make you perfect adventure partners!"
    }
    `

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a relationship compatibility expert who analyzes personality matches."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.6
    })

    const analysis = JSON.parse(response.choices[0].message.content)
    return { success: true, ...analysis }
  } catch (error) {
    console.error('Error analyzing compatibility:', error)
    return {
      success: false,
      error: error.message,
      score: 75,
      commonalities: ["Great personalities"],
      reason: "You both have amazing traits that complement each other perfectly!"
    }
  }
}
/**
 * Placeholder image generation function
 * This is a simplified version that returns a placeholder SVG
 * since Ollama doesn't support direct image generation.
 */

export async function generateImage(prompt: string): Promise<string> {
  try {
    console.log(`Generating placeholder for image with prompt: ${prompt}`);
    
    // Create a simple SVG with the prompt text
    const placeholderText = (prompt || 'No prompt provided')
      .substring(0, 30) // Limit length
      .replace(/[^\w\s]/gi, ''); // Remove special characters
    
    // Return a simple SVG with the prompt text
    return `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial" font-size="16" 
              text-anchor="middle" dominant-baseline="middle" fill="#666">
          Image: ${placeholderText}
        </text>
      </svg>
    `).toString('base64')}`;
    
  } catch (error) {
    console.error('Error in generateImage:', error);
    // Return a simple error SVG
    return `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#ffebee"/>
        <text x="50%" y="50%" font-family="Arial" font-size="16" 
              text-anchor="middle" dominant-baseline="middle" fill="#c62828">
          Error generating image
        </text>
      </svg>
    `).toString('base64')}`;
  }
}

// For backward compatibility
export { generateImage as generateImageWithOllama };

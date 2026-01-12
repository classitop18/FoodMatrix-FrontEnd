"use server";

export async function getUnsplashImage(query: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.warn("Missing UNSPLASH_ACCESS_KEY environment variable");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query,
      )}&per_page=1&orientation=squarish`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    );

    if (!response.ok) {
      console.error(
        "Unsplash API error:",
        response.status,
        response.statusText,
      );
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.small;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch image from Unsplash:", error);
    return null;
  }
}

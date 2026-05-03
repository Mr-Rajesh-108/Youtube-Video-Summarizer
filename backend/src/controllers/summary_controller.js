import Summary from "../models/Summaries.js";

/*
-----------------------------------------
1. CREATE / ADD SUMMARY
-----------------------------------------
*/
const createSummary = async (req, res) => {
  try {
    const { videoTitle, videoUrl, transcript, prompt, response, modelUsed, thumbnail } = req.body;

    if (!videoTitle || !videoUrl || !prompt || !transcript || !response) {
      return res.status(400).json({ message: "Missing required fields: Title, URL, Prompt, Transcript, or Summary Response" });
    }

    const userId = req.user._id;

    let existingVideo = await Summary.findOne({ videoUrl, user: userId });

    if (existingVideo) {
      existingVideo.summary.push({ prompt, response, modelUsed });
      await existingVideo.save();

      return res.status(200).json({
        message: "Summary added successfully",
        data: existingVideo,
      });
    }

    const newSummary = await Summary.create({
      user: userId,
      videoTitle,
      videoUrl,
      thumbnail,
      transcript,
      summary: [{ prompt, response, modelUsed }],
    });

    res.status(201).json({
      message: "Summary created successfully",
      data: newSummary,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating summary", error: error.message });
  }
};

/*
-----------------------------------------
2. GET ALL USER SUMMARIES
-----------------------------------------
*/
const getUserSummaries = async (req, res) => {
  try {
    const userId = req.user._id;

    const summaries = await Summary.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      count: summaries.length,
      data: summaries,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching summaries", error: error.message });
  }
};

/*
-----------------------------------------
3. GET VIDEO SUMMARY HISTORY
-----------------------------------------
Fixed: was reading req.params.videoUrl but the route had no :videoUrl param.
       Now correctly reads videoUrl from req.body.
*/
const getVideoSummary = async (req, res) => {
  try {
    const { videoUrl } = req.body; // Fixed: was req.params.videoUrl (always undefined)

    if (!videoUrl) {
      return res.status(400).json({ message: "videoUrl is required" });
    }

    const summary = await Summary.findOne({
      videoUrl,
      user: req.user._id,
    });

    if (!summary) {
      return res.status(404).json({ message: "Video summary not found" });
    }

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: "Error fetching video summary", error: error.message });
  }
};

/*
-----------------------------------------
4. DELETE A SINGLE SUMMARY
-----------------------------------------
Fixed: added null check before accessing video.summary
       Added ownership check to prevent unauthorized deletion
*/
const deleteOneSummary = async (req, res) => {
  try {
    const { videoId, summaryId } = req.params;

    const video = await Summary.findById(videoId);

    // Fixed: was missing null check — would throw TypeError on missing videoId
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Ownership check — ensure the video belongs to the requesting user
    if (video.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this resource" });
    }

    const originalLength = video.summary.length;
    video.summary = video.summary.filter(
      (item) => item._id.toString() !== summaryId,
    );

    if (video.summary.length === originalLength) {
      return res.status(404).json({ message: "Summary entry not found" });
    }

    await video.save();

    res.status(200).json({ message: "Summary deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting summary", error: error.message });
  }
};

/*
-----------------------------------------
5. DELETE ENTIRE VIDEO HISTORY
-----------------------------------------
Added: null check + ownership check
*/
const deleteVideoSummary = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Summary.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Ownership check
    if (video.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this resource" });
    }

    await Summary.findByIdAndDelete(videoId);

    res.status(200).json({ message: "Video summaries deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting video summary", error: error.message });
  }
};

const getSummaryStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Summary.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          totalPrompts: { $sum: { $size: "$summary" } },
          totalWords: {
            $sum: {
              $reduce: {
                input: "$summary",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    { $size: { $split: [{ $ifNull: ["$$this.response", ""] }, " "] } },
                  ],
                },
              },
            },
          },
        },
      },
    ]);

    const result = stats[0] || { totalVideos: 0, totalPrompts: 0, totalWords: 0 };

    res.status(200).json({
      data: {
        totalVideos: result.totalVideos,
        totalPrompts: result.totalPrompts,
        totalWords: result.totalWords,
        avgPromptsPerVideo: result.totalVideos > 0 ? (result.totalPrompts / result.totalVideos).toFixed(1) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

export {
  createSummary,
  getUserSummaries,
  getVideoSummary,
  deleteOneSummary,
  deleteVideoSummary,
  getSummaryStats,
};

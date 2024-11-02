import { prisma } from "@/prisma/client";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const token = req.headers.authorization?.split(" ")[1];
    const userId = jwt.verify(token, process.env.JWT_SECRET).userId;

    if (!userId) {
      return res.status(401).json({ error: "User must be signed in to rate." });
    }

    const { rating, targetId, targetType } = req.body; // targetId is blogPost or comment ID
    try {
      var existingRating;
      // Check if a rating already exists for this user and target
      if(targetType==="blogPost"){
        existingRating = await prisma.rating.findFirst({
          where: {
            user_id: userId,
            blog_post_id: targetId ,
            
          },
        });
      } else if (targetType === "comment"){
        existingRating = await prisma.rating.findFirst({
          where: {
            user_id: userId,
            comment_id: targetId,
          },
        });
      } else {
        return res.status(500).json({ error: "Only targetType 'blogPost' or 'comment' is allowed" })
      }
      

      if (existingRating) {
        // Update existing rating
        const updatedRating = await prisma.rating.update({
          where: { id: existingRating.id },
          data: { rating },
        });
        if(targetType==="blogPost"){
          if(rating === 1){
            await prisma.blogPost.update({
              where: { id: targetId },
              data: { numOfDownvotes: { increment: -1 } },
            });
          }else{
            await prisma.blogPost.update({
              where: { id: targetId },
              data: { numOfUpvotes: { increment: -1 } },
            });
          }

        } else{
          if(rating === 1){
            await prisma.comment.update({
              where: { id: targetId },
              data: { numOfDownvotes: { increment: -1 } },
            });
          }else{
            await prisma.comment.update({
              where: { id: targetId },
              data: { numOfUpvotes: { increment: -1 } },
            });
          }
        }
        
        return res.status(200).json(updatedRating);
      } else {
        // Create new rating
        var newRating;
        if(targetType=="blogPost"){
          newRating = await prisma.rating.create({
            data: {
              rating,
              user: { connect: { id: userId } },
              blogPost: { connect: { id: targetId } },
              targetType: targetType,
              
            },
          });
          if(rating === 1){
            await prisma.blogPost.update({
              where: { id: targetId },
              data: { numOfUpvotes: { increment: 1 } },
            });
          }else if (rating === -1){
            await prisma.blogPost.update({
              where: { id: targetId },
              data: { numOfDownvotes: { increment: 1 } },
            });
          } else{

          }


        }else{
          newRating = await prisma.rating.create({
            data: {
              rating,
              user: { connect: { id: userId } },
              comment: { connect: { id: targetId } },
              targetType: targetType,
            },
          });
          if(rating === 1){
            await prisma.comment.update({
              where: { id: targetId },
              data: { numOfUpvotes: { increment: 1 } },
            });
          }else if (rating === -1){
            await prisma.comment.update({
              where: { id: targetId },
              data: { numOfDownvotes: { increment: 1 } },
            });
          } else{
            
          }

        }
        return res.status(201).json(newRating);
      }
    } catch (error) {
      console.error("Error updating rating:", error);
      return res.status(500).json({ error: "Could not update rating" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

import React from "react";
import PostNews from "../PostUpNews/PostNews";
import { Box } from "@mui/material";

// Hiển thị danh sách bài "ở ghép khẩn cấp" dùng lại PostNews với postType invite roomate
const PostNewInvite = () => {
    return (
        <Box>
            <PostNews postType="invite roomate" />
        </Box>
    );
};

export default PostNewInvite;
import { Paper, Typography } from '@mui/material';

const Description = ({ description }) => {
  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
        Chào các em sinh viên,<br/><br/>
        {description}<br/><br/>
        Chúng tôi luôn chào đón các bạn đến tham quan và trải nghiệm không gian sống tuyệt vời này. Hãy liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất!
      </Typography>
    </Paper>
  );
};

export default Description;

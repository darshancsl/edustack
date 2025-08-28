import * as React from "react";
import {
  Box, Container, Typography, Card, CardContent, Stack, TextField, MenuItem,
  Divider, Table, TableHead, TableRow, TableCell, TableBody
} from "@mui/material";
import Grid from '@mui/material/GridLegacy';
import NavBar from "../../components/NavBar";
import { getSummary, getTimeseries, getTopCourses, getRecentOrders } from "../../api/analytics";
import { Line, Bar } from "react-chartjs-2";

export default function AdminAnalytics() {
  const [days, setDays] = React.useState(30);
  const [summary, setSummary] = React.useState<any>(null);
  const [tsVisits, setTsVisits] = React.useState<any[]>([]);
  const [tsPurch, setTsPurch] = React.useState<any[]>([]);
  const [tsRevenue, setTsRevenue] = React.useState<any[]>([]);
  const [topCourses, setTopCourses] = React.useState<any[]>([]);
  const [orders, setOrders] = React.useState<any[]>([]);

  const fetchAll = async (d: number) => {
    const [s, v, p, r, t, o] = await Promise.all([
      getSummary(d),
      getTimeseries("visits", d),
      getTimeseries("purchases", d),
      getTimeseries("revenue", d),
      getTopCourses(d, 5),
      getRecentOrders(8),
    ]);
    setSummary(s);
    setTsVisits(v.items);
    setTsPurch(p.items);
    setTsRevenue(r.items);
    setTopCourses(t.items);
    setOrders(o.items);
  };

  React.useEffect(() => { fetchAll(days); }, [days]);

  // Chart.js dataset helpers
  const lineOptions = { responsive: true, plugins: { legend: { display: false } } };
  const barOptions = { responsive: true, plugins: { legend: { display: false } } };

  const visitsData = {
    labels: tsVisits.map(i => i.day),
    datasets: [{ label: "Visits", data: tsVisits.map(i => i.value), borderColor: "#42a5f5", backgroundColor: "rgba(66,165,245,0.4)" }]
  };
  const purchasesData = {
    labels: tsPurch.map(i => i.day),
    datasets: [{ label: "Purchases", data: tsPurch.map(i => i.value), borderColor: "#66bb6a", backgroundColor: "rgba(102,187,106,0.4)" }]
  };
  const revenueData = {
    labels: tsRevenue.map(i => i.day),
    datasets: [{ label: "Revenue", data: tsRevenue.map(i => i.value), backgroundColor: "rgba(255,152,0,0.6)" }]
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: (t) => t.palette.background.default, color: (t) => t.palette.text.primary }}>
      <NavBar />
      <Container sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={900}>Admin · Analytics</Typography>
          <TextField select size="small" label="Range" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            {[7, 14, 30, 90].map(d => <MenuItem key={d} value={d}>{d} days</MenuItem>)}
          </TextField>
        </Stack>

        {/* KPI cards */}
        <Grid container spacing={2}>
          {summary && [
            { label: "Visits", val: summary.visits },
            { label: "Logins", val: summary.logins },
            { label: "Signups", val: summary.signups },
            { label: "Purchases", val: summary.purchases },
            { label: "Revenue", val: `₹${summary.revenue.toFixed(2)}` },
            { label: "Avg DAU", val: Math.round(summary.dau) },
          ].map(k => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={k.label}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ opacity:.75 }}>{k.label}</Typography>
                  <Typography variant="h5" fontWeight={900}>{k.val}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography fontWeight={800}>Visits</Typography>
              <Line data={visitsData} options={lineOptions} />
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography fontWeight={800}>Purchases</Typography>
              <Line data={purchasesData} options={lineOptions} />
            </CardContent></Card>
          </Grid>
          <Grid item xs={12}>
            <Card><CardContent>
              <Typography fontWeight={800}>Revenue</Typography>
              <Bar data={revenueData} options={barOptions} />
            </CardContent></Card>
          </Grid>
        </Grid>

        {/* Top courses */}
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography fontWeight={800}>Top Courses</Typography>
            <Divider sx={{ my: 1 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Course</TableCell>
                  <TableCell align="right">Sales</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topCourses.map(r => (
                  <TableRow key={r.courseSlug}>
                    <TableCell>{r.courseSlug}</TableCell>
                    <TableCell align="right">{r.sales}</TableCell>
                    <TableCell align="right">₹{r.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography fontWeight={800}>Recent Orders</Typography>
            <Divider sx={{ my: 1 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map(o => (
                  <TableRow key={o._id}>
                    <TableCell>{o._id}</TableCell>
                    <TableCell>{o.courseSlug}</TableCell>
                    <TableCell>{o.userId}</TableCell>
                    <TableCell>${o.amount.toFixed(2)} {o.currency}</TableCell>
                    <TableCell>{new Date(o.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

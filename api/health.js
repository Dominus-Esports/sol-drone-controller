export default function handler(req, res) {
  res.status(200).json({ status: 'ok', service: 'S.O.L. Drone Controller', time: new Date().toISOString() });
}

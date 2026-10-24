import { Router } from 'express';
import { pool } from '../config/db.js';

const router = Router();
const badgeDefinitions = [
  { id: 'first-steps', name: 'First Steps', requirement: { events: 1 } },
  { id: 'consistent', name: 'Consistent', requirement: { streak: 7 } },
  { id: 'celebrant', name: 'Celebrant', requirement: { events: 5 } },
  { id: 'collector', name: 'Collector', requirement: { events: 10 } },
  { id: 'dedicated', name: 'Dedicated', requirement: { events: 30 } },
  { id: 'party-starter', name: 'Party Starter', requirement: { events: 25 } },
  { id: 'wishful', name: 'Wishful', requirement: { wishes: 10 } },
  { id: 'anniversary-pro', name: 'Anniversary Pro', requirement: { anniversaries: 5 } },
  { id: 'memory-master', name: 'Memory Master', requirement: { events: 50 } },
  { id: 'champion', name: 'Champion', requirement: { events: 100 } },
  { id: 'legendary', name: 'Legendary', requirement: { events: 365 } },
];

router.get('/', async (req, res, next) => {
  try {
    const [eventStats, activity] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE event_type = 'Anniversary')::int AS anniversaries,
        COUNT(*) FILTER (WHERE event_type ILIKE '%wish%' OR title ILIKE '%wish%' OR notes ILIKE '%wish%')::int AS wishes
        FROM events WHERE user_id=$1`, [req.user.id]),
      pool.query('SELECT activity_date FROM activity_logs WHERE user_id=$1 ORDER BY activity_date DESC LIMIT 60', [req.user.id]),
    ]);

    let streak = 0;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const activeDates = new Set(activity.rows.map(row => new Date(row.activity_date).toISOString().slice(0, 10)));
    for (let offset = 0; offset < 60; offset++) {
      const day = new Date(today);
      day.setUTCDate(today.getUTCDate() - offset);
      if (!activeDates.has(day.toISOString().slice(0, 10))) {
        if (offset === 0) continue;
        break;
      }
      streak++;
    }

    const stats = eventStats.rows[0];
    const total = stats.total;
    const values = { events: total, streak, wishes: stats.wishes, anniversaries: stats.anniversaries };
    const earned = badgeDefinitions.filter(({ requirement }) =>
      Object.entries(requirement).every(([key, target]) => values[key] >= target)
    );

    for (const badge of earned) {
      await pool.query(
        'INSERT INTO user_badges(user_id,badge_id) VALUES($1,$2) ON CONFLICT DO NOTHING',
        [req.user.id, badge.id],
      );
    }

    const savedBadges = await pool.query(
      'SELECT badge_id,unlocked_at FROM user_badges WHERE user_id=$1',
      [req.user.id],
    );
    res.json({ totalEvents: total, streak, badges: savedBadges.rows });
  } catch (error) {
    next(error);
  }
});

export default router;

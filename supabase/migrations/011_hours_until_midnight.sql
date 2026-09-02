-- Keep the salon bookable until midnight (last 2.5-hour slot: 9:30 PM–12:00 AM).

update public.business_hours
set close_time = '00:00:00'
where not is_closed;

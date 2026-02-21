-- Create time slots table for doctor booking system
-- This table will store available time slots for each doctor

-- Create time_slots table if it doesn't exist (simplified version)
CREATE TABLE IF NOT EXISTS time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    slot_type VARCHAR(20) DEFAULT 'regular',
    duration INTEGER DEFAULT 30, -- duration in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- Removed UNIQUE constraint to allow easier data management
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_slots_doctor_id ON time_slots(doctor_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(date);
CREATE INDEX IF NOT EXISTS idx_time_slots_available ON time_slots(is_available);

-- Function to generate time slots for a doctor
CREATE OR REPLACE FUNCTION generate_time_slots_for_doctor(
    p_doctor_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS INTEGER AS $$
DECLARE
    curr_date DATE;
    curr_time TIME;
    slot_count INTEGER := 0;
    day_of_week INTEGER;
BEGIN
    -- Loop through each date
    curr_date := p_start_date;
    WHILE curr_date <= p_end_date LOOP
        -- Get day of week (0 = Sunday, 1 = Monday, etc.)
        day_of_week := EXTRACT(DOW FROM curr_date);
        
        -- Only create slots for weekdays (Monday to Friday)
        IF day_of_week BETWEEN 1 AND 5 THEN
            -- Morning slots: 9:00 AM to 12:00 PM (every 30 minutes)
            curr_time := '09:00:00';
            WHILE curr_time < '12:00:00' LOOP
                INSERT INTO time_slots (doctor_id, date, time, is_available, slot_type)
                VALUES (p_doctor_id, curr_date, curr_time, true, 'morning');
                
                curr_time := curr_time + INTERVAL '30 minutes';
                slot_count := slot_count + 1;
            END LOOP;
            
            -- Afternoon slots: 2:00 PM to 5:00 PM (every 30 minutes)
            curr_time := '14:00:00';
            WHILE curr_time < '17:00:00' LOOP
                INSERT INTO time_slots (doctor_id, date, time, is_available, slot_type)
                VALUES (p_doctor_id, curr_date, curr_time, true, 'afternoon');
                
                curr_time := curr_time + INTERVAL '30 minutes';
                slot_count := slot_count + 1;
            END LOOP;
            
            -- Evening slots: 6:00 PM to 8:00 PM (every 30 minutes)
            curr_time := '18:00:00';
            WHILE curr_time < '20:00:00' LOOP
                INSERT INTO time_slots (doctor_id, date, time, is_available, slot_type)
                VALUES (p_doctor_id, curr_date, curr_time, true, 'evening');
                
                curr_time := curr_time + INTERVAL '30 minutes';
                slot_count := slot_count + 1;
            END LOOP;
        END IF;
        
        -- Move to next date
        curr_date := curr_date + INTERVAL '1 day';
    END LOOP;
    
    RETURN slot_count;
END;
$$ LANGUAGE plpgsql;

-- Generate time slots for all doctors for the next 14 days
DO $$
DECLARE
    doctor_record RECORD;
    start_date DATE := CURRENT_DATE;
    end_date DATE := CURRENT_DATE + INTERVAL '14 days';
    total_slots INTEGER := 0;
    doctor_slots INTEGER;
BEGIN
    RAISE NOTICE 'Generating time slots for all doctors from % to %', start_date, end_date;
    
    -- Loop through all doctors
    FOR doctor_record IN SELECT id, name FROM doctors LOOP
        -- Generate slots for this doctor
        SELECT generate_time_slots_for_doctor(doctor_record.id, start_date, end_date) INTO doctor_slots;
        total_slots := total_slots + doctor_slots;
        
        RAISE NOTICE 'Generated % slots for %', doctor_slots, doctor_record.name;
    END LOOP;
    
    RAISE NOTICE 'Total slots generated: %', total_slots;
END;
$$;

-- Verify the data
SELECT 
    'Time Slots Summary' as info,
    COUNT(*) as total_slots,
    COUNT(DISTINCT doctor_id) as doctors_with_slots,
    MIN(date) as earliest_date,
    MAX(date) as latest_date
FROM time_slots;

-- Show slots per doctor
SELECT 
    d.name as doctor_name,
    COUNT(ts.id) as total_slots,
    COUNT(CASE WHEN ts.is_available THEN 1 END) as available_slots,
    COUNT(CASE WHEN ts.slot_type = 'morning' THEN 1 END) as morning_slots,
    COUNT(CASE WHEN ts.slot_type = 'afternoon' THEN 1 END) as afternoon_slots,
    COUNT(CASE WHEN ts.slot_type = 'evening' THEN 1 END) as evening_slots
FROM doctors d
LEFT JOIN time_slots ts ON d.id = ts.doctor_id
GROUP BY d.id, d.name
ORDER BY d.name;

-- Show sample slots for today
SELECT 
    d.name as doctor_name,
    ts.date,
    ts.time,
    ts.slot_type,
    ts.is_available
FROM doctors d
JOIN time_slots ts ON d.id = ts.doctor_id
WHERE ts.date = CURRENT_DATE
ORDER BY d.name, ts.time
LIMIT 20;
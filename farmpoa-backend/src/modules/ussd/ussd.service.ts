import { getServiceClient } from '@/config/supabase';

interface UssdRequest {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
}

type UssdResponse = `CON ${string}` | `END ${string}`;

export class UssdService {
  async handle(req: UssdRequest): Promise<UssdResponse> {
    const db = getServiceClient();
    const parts = req.text.split('*').filter(Boolean);
    const level = parts.length;

    // Fetch user
    const { data: user } = await db
      .from('users')
      .select('id, full_name, locale')
      .eq('phone', req.phoneNumber)
      .maybeSingle();

    const sw = !user || user.locale === 'sw';

    // Level 0: Main menu
    if (level === 0) {
      return sw
        ? `CON Karibu FarmPOA\n1. Wanyama wangu\n2. Ingiza uzalishaji\n3. Chanjo zinazokaribia\n4. Piga simu daktari\n0. Toka`
        : `CON Welcome to FarmPOA\n1. My Animals\n2. Log Production\n3. Upcoming Vaccinations\n4. Call a Vet\n0. Exit`;
    }

    const choice = parts[0];

    // My Animals
    if (choice === '1' && level === 1) {
      if (!user) return sw ? `END Tafadhali jiandikishe kwanza.` : `END Please register first.`;
      const { data: farms } = await db.from('farms').select('id').eq('owner_id', user.id).limit(1);
      if (!farms?.length) return sw ? `END Huna shamba lililosajiliwa.` : `END No farms registered.`;
      const { count } = await db.from('animals').select('id', { count: 'exact', head: true }).eq('farm_id', farms[0].id).is('deleted_at', null);
      return sw
        ? `END Una wanyama ${count ?? 0} waliorekodiwa.\nTembelea app kwa maelezo zaidi.`
        : `END You have ${count ?? 0} registered animals.\nVisit the app for details.`;
    }

    // Log Production
    if (choice === '2' && level === 1) {
      return sw
        ? `CON Chagua aina ya uzalishaji:\n1. Maziwa (lita)\n2. Mayai\n3. Uzito (kg)`
        : `CON Select production type:\n1. Milk (litres)\n2. Eggs\n3. Weight (kg)`;
    }

    if (choice === '2' && level === 2) {
      return sw
        ? `CON Ingiza thamani:\n(mfano: 12.5)`
        : `CON Enter value:\n(example: 12.5)`;
    }

    if (choice === '2' && level === 3) {
      // Record production
      const metricMap: Record<string, string> = { '1': 'milk_litres', '2': 'eggs_count', '3': 'weight_kg' };
      const metric = metricMap[parts[1]];
      const value = parseFloat(parts[2]);

      if (!user || !metric || isNaN(value) || value <= 0) {
        return sw ? `END Thamani si sahihi.` : `END Invalid value entered.`;
      }

      const { data: farms } = await db.from('farms').select('id').eq('owner_id', user.id).limit(1);
      const { data: animals } = await db.from('animals').select('id').eq('farm_id', farms?.[0]?.id ?? '').limit(1);

      if (farms?.length && animals?.length) {
        await db.from('production_records').insert({
          animal_id: animals[0].id,
          farm_id: farms[0].id,
          log_date: new Date().toISOString().split('T')[0],
          metric: metric as never,
          value,
          recorded_by: user.id,
          session: 'daily',
        });
        return sw ? `END Imerekodiwa: ${value} ${parts[1] === '1' ? 'lita' : parts[1] === '2' ? 'mayai' : 'kg'} leo.` : `END Logged: ${value} ${metric.replace('_', ' ')} for today.`;
      }
      return sw ? `END Hakuna wanyama waliorekodiwa.` : `END No animals found.`;
    }

    // Upcoming Vaccinations
    if (choice === '3') {
      const { data } = await db.from('v_vaccinations_due').select('*').limit(3);
      if (!data?.length) return sw ? `END Hakuna chanjo zinazokaribia.` : `END No vaccinations due soon.`;
      const lines = (data as Record<string, unknown>[]).map(v => `${v['animal_name']} - ${v['vaccine_name']}`).join('\n');
      return `END ${sw ? 'Chanjo zinazokaribia' : 'Upcoming vaccinations'}:\n${lines}`;
    }

    // Exit
    if (choice === '0') {
      return sw ? `END Asante kutumia FarmPOA!` : `END Thank you for using FarmPOA!`;
    }

    return sw ? `END Chaguo si sahihi.` : `END Invalid selection.`;
  }
}

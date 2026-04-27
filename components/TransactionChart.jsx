import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import api from '../services/api';
import { format, subDays, isSameDay } from 'date-fns';

export default function TransactionChart({ accountNo }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/transactions/history/${accountNo}`);
                const logs = res.data;

                // Process last 7 days
                const chartData = [];
                for (let i = 6; i >= 0; i--) {
                    const date = subDays(new Date(), i);

                    const dayLogs = logs.filter(log => isSameDay(new Date(log.txn_date), date));
                    const value = dayLogs.reduce((acc, curr) => {
                        return curr.txn_type === 'CREDIT' ? acc + parseFloat(curr.amount) : acc - parseFloat(curr.amount);
                    }, 0);

                    chartData.push({
                        name: format(date, 'MMM dd'),
                        amount: value
                    });
                }
                setData(chartData);
            } catch (error) {
                console.error("Failed to fetch history data for chart");
            }
        };
        fetchHistory();
    }, [accountNo]);

    return (
        <div className="h-72 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="name"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#6b7280', fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#6b7280', fontWeight: 600 }}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                            backgroundColor: '#111827',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                            padding: '12px'
                        }}
                        itemStyle={{ color: '#10b981', fontWeight: 700 }}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 6, 6]} barSize={32}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.amount >= 0 ? '#10b981' : '#ef4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

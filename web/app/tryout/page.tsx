'use client';

import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { createClient } from '@/supabase/client';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

type ProposedEvent = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  recurrence_rule?: string | null;
  status: 'pending' | 'approved' | 'rejected';
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  proposedEvents?: ProposedEvent[];
};

function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const { events: fetchedEvents, loading, error } = useCalendarEvents(startOfMonth, endOfMonth);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Please sign in</div>;

  const events = fetchedEvents || [];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  const days = [];
  const totalSlots = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalSlots; i++) {
    const dayNumber = i - firstDay + 1;
    days.push(dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null);
  }

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonth(newDate);
    setSelectedDate(null);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return currentMonth.getMonth() === today.getMonth() &&
           currentMonth.getFullYear() === today.getFullYear() &&
           day === today.getDate();
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (selectedDate && 
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(clickedDate);
    }
  };

  const getEventsForDate = (date: Date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => {
      // Convert stored UTC time to local date string for comparison
      const eventDate = new Date(e.start_time);
      const localDateStr = eventDate.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
      return localDateStr === dateStr;
    });
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // FIXED: Calculate event position using LOCAL time, not UTC
  const calculateEventStyle = (event: any) => {
    // Parse the stored UTC timestamp
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    
    // Convert to LOCAL time by using local getters
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    
    // Check if this is an all-day event (starts at 00:00 and ends at 00:00 next day)
    const isAllDay = startMinutes === 0 && endMinutes === 0 && 
                     start.toLocaleDateString('en-CA') !== end.toLocaleDateString('en-CA');
    
    let top = startMinutes;
    let durationMinutes;
    
    if (isAllDay) {
      // Show all-day events at the top as a banner
      top = 0;
      durationMinutes = 30; // Compact banner
    } else if (endMinutes === 0 && startMinutes !== 0) {
      // Event ends at midnight
      durationMinutes = 24 * 60 - startMinutes;
    } else if (endMinutes <= startMinutes) {
      // Same-day or overnight event
      durationMinutes = endMinutes + 24 * 60 - startMinutes;
    } else {
      // Normal event
      durationMinutes = endMinutes - startMinutes;
    }
    
    const height = isAllDay ? 30 : Math.max(durationMinutes, 25);
    
    return { top, height, isAllDay };
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a0044', margin: 0 }}>
          Your Calendar
        </h2>
        <p style={{ color: '#4F4F63', fontSize: 14, marginTop: 6 }}>
          Track your mood and activities over time
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <p style={{ color: '#8B8B9A' }}>Loading your calendar...</p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'flex',
            gap: 20,
            minHeight: '500px',
          }}>
            {/* Left: Month Grid */}
            <div style={{
              flex: selectedDate ? '0.45' : '1',
              transition: 'flex 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <button onClick={() => changeMonth(-1)} style={calendarNavButton}>←</button>
                <span style={{ fontWeight: 700, color: '#1a0044' }}>
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => changeMonth(1)} style={calendarNavButton}>→</button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 6,
                textAlign: 'center',
                fontSize: 12,
                fontWeight: 600,
                color: '#8B8B9A',
                marginBottom: 8,
              }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 6,
              }}>
                {days.map((day, index) => {
                  const isSelected = selectedDate && 
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === currentMonth.getMonth();
                  const today = day !== null && isToday(day);

                  return (
                    <button
                      key={index}
                      disabled={day === null}
                      style={{
                        opacity: day === null ? 0 : 1,
                        aspectRatio: '1 / 1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: isSelected ? 700 : 500,
                        background: isSelected ? '#3B1D86' : today && !isSelected ? '#F0EEF8' : 'transparent',
                        color: isSelected ? 'white' : '#1a0044',
                        border: today && !isSelected ? '2px solid #3B1D86' : 'none',
                        cursor: day !== null ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => day !== null && handleDateClick(day)}
                      onMouseEnter={(e) => {
                        if (day !== null && !isSelected && !today) {
                          e.currentTarget.style.background = '#F0EEF8';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (day !== null && !isSelected && !today) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {day !== null ? day : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Day View with Time-Scaled Events */}
            {selectedDate && (
              <div style={{
                flex: '0.55',
                borderLeft: '1px solid #E8E8EC',
                paddingLeft: 20,
                minHeight: '500px',
                maxHeight: '600px',
                overflowY: 'auto',
                position: 'relative',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#1a0044',
                    margin: 0,
                  }}>
                    {selectedDate.toLocaleDateString('default', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <button
                    onClick={() => setSelectedDate(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 20,
                      cursor: 'pointer',
                      color: '#8B8B9A',
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{
                  position: 'relative',
                  minHeight: '1440px',
                }}>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const isNow = new Date().getHours() === hour && 
                                 selectedDate.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={hour}
                        style={{
                          position: 'relative',
                          height: '60px',
                          borderBottom: '1px solid #F0F0F4',
                          display: 'flex',
                          alignItems: 'flex-start',
                          background: isNow ? 'rgba(59, 29, 134, 0.05)' : 'transparent',
                        }}
                      >
                        <span style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: isNow ? '#3B1D86' : '#8B8B9A',
                          minWidth: 45,
                          paddingTop: 2,
                        }}>
                          {displayHour}:00 {ampm}
                        </span>
                        
                        <div style={{
                          flex: 1,
                          position: 'relative',
                          height: '100%',
                        }}>
                          {[0, 15, 30, 45].map((minute) => (
                            <div
                              key={`main-min-${hour}-${minute}`}
                              style={{
                                position: 'absolute',
                                top: `${(minute / 60) * 100}%`,
                                left: 0,
                                right: 0,
                                borderTop: minute === 0 
                                  ? '1px solid #E8E8EC' 
                                  : '1px dashed #F0F0F4',
                                height: 0,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {selectedEvents.map((event) => {
                    const { top, height, isAllDay } = calculateEventStyle(event);
                    const startTime = new Date(event.start_time);
                    const endTime = new Date(event.end_time);
                    
                    return (
                      <div
                        key={event.id}
                        style={{
                          position: 'absolute',
                          top: `${top}px`,
                          left: isAllDay ? '45px' : '65px',
                          right: '10px',
                          height: `${height}px`,
                          background: isAllDay 
                            ? 'linear-gradient(135deg, #F0EEF8 0%, #E8E4F4 100%)' 
                            : 'linear-gradient(135deg, #3B1D86 0%, #2A005C 100%)',
                          color: isAllDay ? '#1a0044' : 'white',
                          padding: '4px 10px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 500,
                          display: 'flex',
                          flexDirection: isAllDay ? 'row' : 'column',
                          justifyContent: 'center',
                          alignItems: isAllDay ? 'center' : 'flex-start',
                          gap: isAllDay ? 8 : 0,
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(59, 29, 134, 0.15)',
                          zIndex: 10,
                          border: isAllDay ? '1px solid rgba(59, 29, 134, 0.2)' : '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <div style={{ 
                          fontWeight: 700, 
                          fontSize: 12,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {event.title}
                        </div>
                        {isAllDay ? (
                          <div style={{ fontSize: 10, opacity: 0.7, whiteSpace: 'nowrap' }}>
                            All day
                          </div>
                        ) : (
                          <div style={{ 
                            fontSize: 10, 
                            opacity: 0.85,
                            whiteSpace: 'nowrap',
                          }}>
                            {startTime.toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit', 
                              hour12: true 
                            })} 
                            {' - '}
                            {endTime.toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit', 
                              hour12: true 
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {selectedEvents.length === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: '#8B8B9A',
                      fontSize: 14,
                    }}>
                      No events on this day ✨
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mood summary */}
          <div style={{
            marginTop: 28,
            padding: '18px 20px',
            background: '#FAFAFF',
            borderRadius: 20,
            border: '1px solid rgba(59, 29, 134, 0.10)',
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a0044', margin: '0 0 12px 0' }}>
              Recent moods
            </h3>
            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { mood: '😊', day: 'Mon' },
                { mood: '😐', day: 'Tue' },
                { mood: '😔', day: 'Wed' },
                { mood: '😊', day: 'Thu' },
                { mood: '😌', day: 'Fri' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: 28 }}>{item.mood}</div>
                  <div style={{ fontSize: 10, color: '#8B8B9A', marginTop: 4 }}>{item.day}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'calendar'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi there. I'm Solace. How are you feeling today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  // ✅ Get user name and update welcome message
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const name = data.user.user_metadata?.full_name ?? null;
        if (name) {
          setMessages([
            {
              id: '1',
              role: 'assistant',
              content: `Hi there ${name}. I'm Solace. How are you feeling today?`,
            },
          ]);
        }
      }
    });
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const previousMessages = messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ 
        message: userMessage.content,
        history: previousMessages  
      }),
    });
    
    const data = await response.json();
    console.log('FULL API RESPONSE:', data);  // ADD THIS
    console.log('proposedEvents:', data.proposedEvents);  // ADD THIS
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: data.reply,
      proposedEvents: data.proposedEvents || undefined,
    };
    setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I had trouble responding. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEventAction = async (eventId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/event-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingEventId: eventId, action }),
      });

      const result = await response.json(); 
      console.log('Approve result:', result); 
      
      if (response.ok) {
        // Update the message's proposedEvents status
        setMessages(prev => prev.map(msg => ({
          ...msg,
          proposedEvents: msg.proposedEvents?.map(e => 
            e.id === eventId ? { ...e, status: action === 'approve' ? 'approved' : 'rejected' } : e
          )
        })));
      }
    } catch (error) {
      console.error('Event action error:', error);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F6FB" }}>
      <Header />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 20px 28px" }}>
        <div style={chatCard}>
          {/* Toggle */}
          <div style={toggleContainer}>
            <button
              onClick={() => setActiveTab('chat')}
              style={{
                ...toggleButton,
                background: activeTab === 'chat' ? 'linear-gradient(180deg, #3B1D86 0%, #2A005C 100%)' : 'transparent',
                color: activeTab === 'chat' ? 'white' : '#4F4F63',
                boxShadow: activeTab === 'chat' ? '0 6px 14px rgba(42,0,92,0.22)' : 'none',
              }}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              style={{
                ...toggleButton,
                background: activeTab === 'calendar' ? 'linear-gradient(180deg, #3B1D86 0%, #2A005C 100%)' : 'transparent',
                color: activeTab === 'calendar' ? 'white' : '#4F4F63',
                boxShadow: activeTab === 'calendar' ? '0 6px 14px rgba(42,0,92,0.22)' : 'none',
              }}
            >
              Calendar
            </button>
          </div>

          {/* Content */}
          <div style={chatContentArea}>
            {activeTab === 'chat' ? (
              <>
                {/* Messages container */}
                <div style={messagesContainer}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        display: 'flex',
                        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          maxWidth: message.proposedEvents ? '92%' : '75%',
                          padding: message.proposedEvents ? '0' : '10px 16px',
                          borderRadius: 20,
                          fontSize: 14,
                          lineHeight: 1.5,
                          background: message.role === 'user'
                            ? 'linear-gradient(135deg, #3B1D86 0%, #2A005C 100%)'
                            : message.proposedEvents ? 'transparent' : 'white',
                          color: message.role === 'user' ? 'white' : '#1a0044',
                          boxShadow: message.proposedEvents ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                          border: message.role === 'assistant' && !message.proposedEvents ? '1px solid rgba(59, 29, 134, 0.12)' : 'none',
                        }}
                      >
                        {message.proposedEvents ? (
                          <div style={{
                            background: 'white',
                            borderRadius: 20,
                            padding: '16px',
                            border: '1px solid rgba(59, 29, 134, 0.15)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                          }}>
                            <p style={{ margin: '0 0 14px 0', fontSize: 14, color: '#1a0044', lineHeight: 1.5, fontWeight: 500 }}>
                              {message.content}
                            </p>
                            {message.proposedEvents.map((event) => {
                              const start = new Date(event.start_time);
                              const end = new Date(event.end_time);
                              const isAllDay = start.getHours() === 0 && end.getHours() === 0;
                              const startHour = start.getHours();
                              const endHour = end.getHours();
                              
                              // Build the timeline hours (6am to 10pm window around the event)
                              const displayStart = Math.max(0, startHour - 3);
                              const displayEnd = Math.min(23, endHour + 3);
                              const totalHours = displayEnd - displayStart + 1;
                              
                              return (
                                <div
                                  key={event.id}
                                  style={{
                                    borderRadius: 16,
                                    overflow: 'hidden',
                                    border: '1px solid rgba(59, 29, 134, 0.10)',
                                  }}
                                >
                                  {/* Event header */}
                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px 14px',
                                    background: event.status === 'pending' 
                                      ? 'linear-gradient(135deg, #3B1D86 0%, #2A005C 100%)' 
                                      : event.status === 'approved' 
                                      ? '#E8F5E9' 
                                      : '#FFEBEE',
                                    color: event.status === 'pending' ? 'white' : '#1a0044',
                                  }}>
                                    <div>
                                      <div style={{ fontWeight: 700, fontSize: 13 }}>
                                        {event.title}
                                      </div>
                                      <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
                                        {start.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                        {isAllDay ? ' · All day' : 
                                          ` · ${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                                        }
                                        {event.recurrence_rule && ' · 🔁 Weekly'}
                                      </div>
                                    </div>

                                    {event.status === 'pending' && (
                                      <div style={{ display: 'flex', gap: 6 }}>
                                        <button
                                          onClick={() => {
                                            console.log('Add button clicked!', event.id);
                                            handleEventAction(event.id, 'approve');
                                          }}
                                          style={{
                                            background: 'white',
                                            color: '#3B1D86',
                                            border: 'none',
                                            borderRadius: 16,
                                            padding: '5px 12px',
                                            fontSize: 11,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                          }}
                                        >
                                          ✓ Add
                                        </button>
                                        <button
                                          onClick={() => {
                                            console.log('Reject button clicked!', event.id);
                                            handleEventAction(event.id, 'reject');
                                          }}
                                          style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            borderRadius: 16,
                                            padding: '5px 12px',
                                            fontSize: 11,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                          }}
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    )}

                                    {event.status === 'approved' && (
                                      <span style={{ fontSize: 11, fontWeight: 600 }}>✓ Added</span>
                                    )}
                                    {event.status === 'rejected' && (
                                      <span style={{ fontSize: 11, fontWeight: 600 }}>✕ Declined</span>
                                    )}
                                  </div>

                                  {/* Mini timeline - styled like the main calendar day view */}
                                  {!isAllDay && (
                                    <div style={{
                                      height: 200,
                                      overflowY: 'auto',
                                      position: 'relative',
                                      background: '#FAFAFF',
                                      borderTop: '1px solid rgba(59, 29, 134, 0.08)',
                                    }}>
                                      <div style={{
                                        position: 'relative',
                                        minHeight: '1440px',
                                      }}>
                                        {/* Hour grid */}
                                        {Array.from({ length: 24 }, (_, hour) => {
                                          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                                          const ampm = hour >= 12 ? 'PM' : 'AM';
                                          const isEventHour = hour >= startHour - 1 && hour <= endHour + 1;

                                          return (
                                            <div
                                              key={`hour-${hour}`}
                                              style={{
                                                position: 'absolute',
                                                top: hour * 60,
                                                left: 0,
                                                right: 0,
                                                height: 60,
                                                borderBottom: '1px solid #F0F0F4',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                background: isEventHour ? 'rgba(59, 29, 134, 0.03)' : 'transparent',
                                              }}
                                            >
                                              <span style={{
                                                fontSize: 10,
                                                fontWeight: 600,
                                                color: '#8B8B9A',
                                                minWidth: 42,
                                                paddingTop: 2,
                                                paddingLeft: 4,
                                              }}>
                                                {displayHour}:00
                                              </span>
                                              <span style={{ fontSize: 9, color: '#B0B0C0', paddingTop: 2 }}>
                                                {ampm}
                                              </span>
                                              <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                                                {[15, 30, 45].map((minute) => (
                                                  <div
                                                    key={`min-${hour}-${minute}`}
                                                    style={{
                                                      position: 'absolute',
                                                      top: `${(minute / 60) * 100}%`,
                                                      left: 0,
                                                      right: 0,
                                                      borderTop: '1px dashed #F0F0F4',
                                                      height: 0,
                                                    }}
                                                  />
                                                ))}
                                              </div>
                                            </div>
                                          );
                                        })}

                                        {/* Proposed event block (glowing) */}
                                        {!isNaN(start.getTime()) && !isNaN(end.getTime()) && (
                                          <div style={{
                                            position: 'absolute',
                                            top: startHour * 60 + start.getMinutes(),
                                            left: 54,
                                            right: 8,
                                            height: Math.max(
                                              (endHour - startHour) * 60 + (end.getMinutes() - start.getMinutes()),
                                              25
                                            ),
                                            background: 'linear-gradient(135deg, #3B1D86 0%, #5B3DAC 100%)',
                                            borderRadius: 10,
                                            zIndex: 10,
                                            boxShadow: '0 0 20px rgba(59, 29, 134, 0.6), 0 0 6px rgba(59, 29, 134, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                                            border: '2px solid rgba(255,255,255,0.5)',
                                            padding: '6px 10px',
                                            overflow: 'hidden',
                                          }}>
                                            <div style={{
                                              fontSize: 11,
                                              fontWeight: 700,
                                              color: 'white',
                                              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                            }}>
                                              {event.title}
                                            </div>
                                            <div style={{
                                              fontSize: 9,
                                              color: 'rgba(255,255,255,0.85)',
                                              marginTop: 2,
                                            }}>
                                              {start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} 
                                              {' - '}
                                              {end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
                      <div style={{
                        background: 'white',
                        padding: '10px 16px',
                        borderRadius: 20,
                        border: '1px solid rgba(59, 29, 134, 0.12)',
                      }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <span style={dotAnimation}>.</span>
                          <span style={{ ...dotAnimation, animationDelay: '0.2s' }}>.</span>
                          <span style={{ ...dotAnimation, animationDelay: '0.4s' }}>.</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div style={inputArea}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      style={{
                        flex: 1,
                        resize: 'none',
                        borderRadius: 20,
                        border: '1px solid rgba(59, 29, 134, 0.16)',
                        padding: '12px 18px',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        background: 'white',
                        maxHeight: '120px',
                        color: '#1a0044'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#3B1D86';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 29, 134, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(59, 29, 134, 0.16)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      style={{
                        background: 'linear-gradient(180deg, #3B1D86 0%, #2A005C 100%)',
                        border: 'none',
                        borderRadius: 20,
                        padding: '0 20px',
                        cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
                        opacity: !input.trim() || isLoading ? 0.5 : 1,
                        transition: 'transform 0.1s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="white"
                        style={{ width: 20, height: 20 }}
                      >
                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                      </svg>
                    </button>
                  </div>
                  <p style={{
                    marginTop: 12,
                    textAlign: 'center',
                    fontSize: 11,
                    color: '#8B8B9A',
                  }}>
                    Solace is not a medical service. If you need urgent help, contact local emergency services.
                  </p>
                </div>
              </>
            ) : (
              <CalendarView />
            )}
          </div>
        </div>

        <section style={{ marginTop: 24, textAlign: "center" }}>
          <div style={{ color: "#4F4F63", fontSize: 16 }}>
            Ready to continue?
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <PrimaryButton label="Log in" />
            </Link>
            <Link href="/signup" style={{ textDecoration: "none" }}>
              <SecondaryButton label="Sign up" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* -------------------- Header / Footer -------------------- */

function Header() {
  return (
    <header style={topBar}>
      <div style={topBarInner}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/solace-logo.png" alt="Solace" width={72} height={72} />
          <div style={{ color: "white", fontWeight: 800, fontSize: 22, letterSpacing: 0.2 }}>Solace</div>
        </Link>

        <nav style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <NavLink href="/tryout" label="Try Out" />
          <NavLink href="/about" label="About" />
          <NavLink href="/signup" label="Sign Up" />
          <NavLink href="/login" label="Login" primary />
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer style={footerWrap}>
      <div style={footerInner}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/solace-logo.png" alt="Solace" width={34} height={34} />
          <div style={{ color: "white", fontWeight: 800 }}>Solace</div>
        </div>

        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
          © {new Date().getFullYear()} Solace. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function NavLink({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        padding: "10px 14px",
        borderRadius: 999,
        fontSize: 14,
        fontWeight: 700,
        background: primary ? "white" : "rgba(255,255,255,0.12)",
        color: primary ? "#1a0044" : "white",
        border: primary ? "1px solid rgba(255,255,255,0.6)" : "1px solid rgba(255,255,255,0.18)",
        transition: "transform 120ms ease, background 120ms ease",
      }}
    >
      {label}
    </Link>
  );
}

/* -------------------- UI Bits (same as original) -------------------- */

function PrimaryButton({ label, full }: { label: string; full?: boolean }) {
  return (
    <button
      style={{
        width: full ? "100%" : "auto",
        background: "linear-gradient(180deg, #3B1D86 0%, #2A005C 100%)",
        color: "white",
        border: "1px solid rgba(255,255,255,0.18)",
        padding: "12px 16px",
        borderRadius: 14,
        fontSize: 15,
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: "0 10px 24px rgba(42,0,92,0.22)",
      }}
    >
      {label}
    </button>
  );
}

function SecondaryButton({ label }: { label: string }) {
  return (
    <button
      style={{
        background: "white",
        color: "#2A005C",
        border: "1px solid rgba(42,0,92,0.14)",
        padding: "12px 16px",
        borderRadius: 14,
        fontSize: 15,
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: "0 10px 24px rgba(20,20,40,0.06)",
      }}
    >
      {label}
    </button>
  );
}

/* -------------------- New Chat Card Styles -------------------- */

const chatCard: React.CSSProperties = {
  background: "white",
  borderRadius: 26,
  boxShadow: "0 22px 60px rgba(16, 16, 30, 0.08)",
  border: "1px solid rgba(20,20,40,0.06)",
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const toggleContainer: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  padding: '20px 24px 0 24px',
  borderBottom: '1px solid rgba(59, 29, 134, 0.08)',
};

const toggleButton: React.CSSProperties = {
  flex: 1,
  padding: '10px 16px',
  borderRadius: 40,
  fontSize: 15,
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'inherit',
};

const chatContentArea: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '540px',
};

const messagesContainer: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '20px 24px',
  display: 'flex',
  flexDirection: 'column',
};

const inputArea: React.CSSProperties = {
  padding: '16px 24px 20px',
  borderTop: '1px solid rgba(59, 29, 134, 0.08)',
  background: '#FAFAFF',
};

const dotAnimation: React.CSSProperties = {
  display: 'inline-block',
  fontSize: 20,
  lineHeight: 1,
  animation: 'bounce 1.4s infinite ease-in-out both',
};

/* Add keyframes for bounce animation */
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1.2); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

/* -------------------- Style Objects (same as original) -------------------- */

const topBar: React.CSSProperties = {
  background: "linear-gradient(180deg, #2a005c 0%, #1a0044 100%)",
  padding: "20px 22px",
  borderBottomLeftRadius: 26,
  borderBottomRightRadius: 26,
  boxShadow: "0 18px 40px rgba(26,0,68,0.22)",
};

const topBarInner: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
};

const footerWrap: React.CSSProperties = {
  marginTop: 30,
  background: "linear-gradient(180deg, #2a005c 0%, #1a0044 100%)",
  padding: "18px 18px",
  borderTopLeftRadius: 26,
  borderTopRightRadius: 26,
};

const footerInner: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
};

const calendarNavButton: React.CSSProperties = {
  background: '#F0EEF8',
  border: 'none',
  borderRadius: 30,
  padding: '8px 16px',
  fontSize: 14,
  fontWeight: 600,
  color: '#3B1D86',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};
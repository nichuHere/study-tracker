// This is the new exam view design - will be integrated into StudyTracker.jsx

{/* Header with Add Exam Button */}
<div className="flex items-center justify-between mb-6">
  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
    <Book className="w-7 h-7 text-indigo-600" />
    Exam Management
  </h2>
  <button
    onClick={() => setShowAddExam(true)}
    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-lg transition-all"
  >
    <Plus className="w-5 h-5" />
    Add New Exam
  </button>
</div>

{/* Add Exam Modal */}
{showAddExam && (
  <div className="mb-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200 shadow-lg">
    <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Exam</h3>
    
    <input
      type="text"
      placeholder="Exam Name (e.g., February Class Test, Annual Exam)"
      value={newExam.name}
      onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
      className="w-full p-3 border-2 border-indigo-300 rounded-lg font-semibold text-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    />
    
    {/* Add Subjects Section */}
    <div className="bg-white rounded-lg p-4 mb-4 border-2 border-gray-200">
      <h4 className="font-semibold text-gray-700 mb-3">Add Subjects</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <select
          value={newExamSubject.subject}
          onChange={(e) => setNewExamSubject({ ...newExamSubject, subject: e.target.value })}
          className="p-2 border rounded-lg"
        >
          <option value="">Select Subject</option>
          {subjects.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
        
        <input
          type="date"
          value={newExamSubject.date}
          onChange={(e) => setNewExamSubject({ ...newExamSubject, date: e.target.value })}
          className="p-2 border rounded-lg"
        />
      </div>
      
      {/* Quick Chapter Selection */}
      {newExamSubject.subject && (() => {
        const selectedSubject = subjects.find(s => s.name === newExamSubject.subject);
        const availableChapters = selectedSubject?.chapters?.filter(
          ch => !newExamSubject.chapters.some(ec => ec.name === ch)
        ) || [];
        
        return availableChapters.length > 0 && (
          <select
            onChange={(e) => {
              if (e.target.value) {
                setNewExamSubject({
                  ...newExamSubject,
                  chapters: [...newExamSubject.chapters, { name: e.target.value, status: 'pending' }]
                });
                e.target.value = '';
              }
            }}
            className="w-full p-2 border rounded-lg mb-2 bg-blue-50"
          >
            <option value="">+ Add chapter from {newExamSubject.subject}</option>
            {availableChapters.map((ch, i) => (
              <option key={i} value={ch}>{ch}</option>
            ))}
          </select>
        );
      })()}
      
      {/* Manual Chapter Input */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Or type chapter name..."
          value={examChapterInput}
          onChange={(e) => setExamChapterInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && examChapterInput.trim()) {
              setNewExamSubject({
                ...newExamSubject,
                chapters: [...newExamSubject.chapters, { name: examChapterInput, status: 'pending' }]
              });
              setExamChapterInput('');
            }
          }}
          className="flex-1 p-2 border rounded-lg"
        />
        <button
          onClick={() => {
            if (examChapterInput.trim()) {
              setNewExamSubject({
                ...newExamSubject,
                chapters: [...newExamSubject.chapters, { name: examChapterInput, status: 'pending' }]
              });
              setExamChapterInput('');
            }
          }}
         className="px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Add
        </button>
      </div>
      
      {/* Selected Chapters Preview */}
      {newExamSubject.chapters.length > 0 && (
        <div className="bg-gray-50 rounded p-2 mb-2">
          <div className="text-xs text-gray-600 mb-1">Chapters ({newExamSubject.chapters.length}):</div>
          <div className="flex flex-wrap gap-1">
            {newExamSubject.chapters.map((ch, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded border text-sm">
                {ch.name}
                <button
                  onClick={() => {
                    setNewExamSubject({
                      ...newExamSubject,
                      chapters: newExamSubject.chapters.filter((_, i) => i !== idx)
                    });
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      
      <textarea
        placeholder="Notes/Key topics (optional)"
        value={newExamSubject.keyPoints}
        onChange={(e) => setNewExamSubject({ ...newExamSubject, keyPoints: e.target.value })}
        className="w-full p-2 border rounded-lg mb-2"
        rows="2"
      />
      
      <button
        onClick={addSubjectToExam}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
        disabled={!newExamSubject.subject || !newExamSubject.date}
      >
        + Add This Subject to Exam
      </button>
    </div>
    
    {/* Added Subjects Preview */}
    {newExam.subjects.length > 0 && (
      <div className="bg-white rounded-lg p-4 mb-4 border-2 border-green-200">
        <h4 className="font-semibold text-gray-700 mb-2">Subjects Added ({newExam.subjects.length}):</h4>
        <div className="space-y-2">
          {newExam.subjects.map((subj, i) => (
            <div key={i} className="flex items-start justify-between p-3 bg-green-50 rounded border">
              <div className="flex-1">
                <div className="font-bold text-gray-800">{subj.subject}</div>
                <div className="text-sm text-gray-600">
                  {new Date(subj.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                {subj.chapters && subj.chapters.length > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    {subj.chapters.length} chapters
                  </div>
                )}
              </div>
              <button
                onClick={() => removeSubjectFromExam(i)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    )}
    
    <div className="flex gap-3">
      <button
        onClick={addExam}
        disabled={!newExam.name.trim() || newExam.subjects.length === 0}
        className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold shadow-lg"
      >
        Create Exam
      </button>
      <button
        onClick={() => {
          setShowAddExam(false);
          setNewExam({ name: '', subjects: [] });
          setNewExamSubject({ subject: '', date: '', chapters: [], keyPoints: '' });
          setExamChapterInput('');
        }}
        className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
      >
        Cancel
      </button>
    </div>
  </div>
)}

{/* Main Content - Categorized Exams */}
{(() => {
  const { urgent, soon, future } = categorizeExams();
  const hasExams = urgent.length > 0 || soon.length > 0 || future.length > 0;
  
  if (!hasExams) {
    return (
      <div className="bg-white rounded-xl p-12 text-center shadow-lg">
        <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Exams Scheduled</h3>
        <p className="text-gray-500 mb-6">Click "Add New Exam" to get started!</p>
      </div>
    );
  }
  
  return (
    <>
      {/* URGENT EXAMS (< 7 days) */}
      {urgent.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-bold text-red-600">Urgent - This Week ({urgent.length})</h3>
          </div>
          
          <div className="space-y-4">
            {urgent.map(exam => {
              const progress = getExamProgress(exam);
              
              return (
                <div key={exam.id} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-300 shadow-lg">
                  {/* Exam Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {editingExam === exam.id ? (
                        <input
                          type="text"
                          value={exam.name}
                          onChange={(e) => updateExam(exam.id, { name: e.target.value })}
                          className="w-full p-2 border-2 border-red-400 rounded-lg font-bold text-xl bg-white"
                        />
                      ) : (
                        <h4 className="text-2xl font-bold text-gray-800">{exam.name}</h4>
                      )}
                      <p className="text-sm text-red-600 font-semibold mt-1">⏰ Starting in {exam.daysUntil} {exam.daysUntil === 1 ? 'day' : 'days'}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {editingExam === exam.id ? (
                        <button
                          onClick={() => setEditingExam(null)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                        >
                          Done
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingExam(exam.id)}
                          className="p-2 text-indigo-600 hover:bg-white rounded-lg"
                        >
                         <Edit2 className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${exam.name}"?`)) {
                            deleteExam(exam.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-white rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Overall Progress */}
                  {progress.totalChapters > 0 && (
                    <div className="bg-white rounded-lg p-4 mb-4 shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-700">Overall Progress</span>
                        <span className="font-bold text-lg">{progress.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            progress.percentage === 100 ? 'bg-green-500' :
                            progress.percentage >= 75 ? 'bg-blue-500' :
                            progress.percentage >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600 font-semibold">✓ {progress.completed} Completed</span>
                        <span className="text-yellow-600 font-semibold">⚡ {progress.started} In Progress</span>
                        <span className="text-gray-600">○ {progress.pending} Pending</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Subjects */}
                  <div className="space-y-3">
                    {exam.subjects && exam.subjects.map((subject, subjectIdx) => {
                      const daysLeft = getDaysUntil(subject.date);
                      const subjectProg = getSubjectProgress(subject);
                      
                      return (
                        <div key={subjectIdx} className="bg-white rounded-lg p-4 shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h5 className="text-lg font-bold text-gray-800">{subject.subject}</h5>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                  daysLeft === 0 ? 'bg-red-600 text-white' :
                                  daysLeft <= 3 ? 'bg-red-100 text-red-700' :
                                  'bg-orange-100 text-orange-700'
                                }`}>
                                  {daysLeft === 0 ? '🔥 Today!' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`}
                                </span>
                              </div>
                              {editingExam === exam.id ? (
                                <input
                                  type="date"
                                  value={subject.date}
                                  onChange={(e) => {
                                    const updatedSubjects = [...exam.subjects];
                                    updatedSubjects[subjectIdx] = { ...subject, date: e.target.value };
                                    updateExam(exam.id, { subjects: updatedSubjects });
                                  }}
                                  className="mt-1 p-1 border rounded"
                                />
                              ) : (
                                <p className="text-sm text-gray-600 mt-1">
                                  📅 {new Date(subject.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                              )}
                            </div>
                            
                            {editingExam === exam.id && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Remove ${subject.subject}?`)) {
                                    deleteSubjectFromExam(exam.id, subjectIdx);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          {/* Subject Progress */}
                          {subjectProg.total > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-bold">{subjectProg.percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${subjectProg.percentage}%` }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Chapters */}
                          {subject.chapters && subject.chapters.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-gray-600 mb-2">Chapters:</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {subject.chapters.map((chapter, chapterIdx) => (
                                  <div key={chapterIdx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <div className="flex-1 text-sm">{chapter.name}</div>
                                    {editingExam === exam.id ? (
                                      <div className="flex items-center gap-1">
                                        <select
                                          value={chapter.status}
                                          onChange={(e) => updateChapterStatus(exam.id, subjectIdx, chapterIdx, e.target.value)}
                                          className={`text-xs px-2 py-1 rounded font-semibold ${
                                            chapter.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            chapter.status === 'started' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-600'
                                          }`}
                                        >
                                          <option value="pending">Pending</option>
                                          <option value="started">Started</option>
                                          <option value="completed">Done</option>
                                        </select>
                                        <button
                                          onClick={() => deleteChapterFromExamSubject(exam.id, subjectIdx, chapterIdx)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          const statuses = ['pending', 'started', 'completed'];
                                          const currentIndex = statuses.indexOf(chapter.status);
                                          const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                          updateChapterStatus(exam.id, subjectIdx, chapterIdx, nextStatus);
                                        }}
                                        className={`text-xs px-2 py-1 rounded font-semibold ${
                                          chapter.status === 'completed' ? 'bg-green-100 text-green-700' :
                                          chapter.status === 'started' ? 'bg-yellow-100 text-yellow-700' :
                                          'bg-gray-100 text-gray-600'
                                        }`}
                                      >
                                        {chapter.status === 'completed' ? '✓' : chapter.status === 'started' ? '⚡' : '○'}
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {subject.keyPoints && (
                            <div className="mt-3 p-2 bg-yellow-50 rounded text-sm italic text-gray-700">
                              💡 {subject.keyPoints}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* SOON EXAMS (7-21 days) */}
      {soon.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-yellow-600" />
            <h3 className="text-xl font-bold text-yellow-600">Coming Up - Next 3 Weeks ({soon.length})</h3>
          </div>
          
          <div className="space-y-4">
            {soon.map(exam => {
              const progress = getExamProgress(exam);
              const isMinimized = minimizedExams[exam.id];
              
              return (
                <div key={exam.id} className="bg-yellow-50 rounded-xl p-5 border-2 border-yellow-200 shadow">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setMinimizedExams(prev => ({ ...prev, [exam.id]: !prev[exam.id] }))}
                  >
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-800">{exam.name}</h4>
                      <p className="text-sm text-yellow-700 font-semibold mt-1">
                        📅 Starting in {exam.daysUntil} days
                      </p>
                      {progress.totalChapters > 0 && (
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-700">{progress.percentage}% complete</span>
                          <span className="text-green-600">✓ {progress.completed}</span>
                          <span className="text-yellow-600">⚡ {progress.started}</span>
                          <span className="text-gray-500">○ {progress.pending}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingExam(editingExam === exam.id ? null : exam.id);
                        }}
                        className="p-2 hover:bg-white rounded-lg"
                      >
                        <Edit2 className="w-4 h-4 text-indigo-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${exam.name}"?`)) {
                            deleteExam(exam.id);
                          }
                        }}
                        className="p-2 hover:bg-white rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                      <button className="p-2">
                        {isMinimized ? <Plus className="w-5 h-5" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>}
                      </button>
                    </div>
                  </div>
                  
                  {!isMinimized && (
                    <div className="mt-4 space-y-2">
                      {exam.subjects && exam.subjects.map((subject, subjectIdx) => {
                        const daysLeft = getDaysUntil(subject.date);
                        const subjectProg = getSubjectProgress(subject);
                        
                        return (
                          <div key={subjectIdx} className="bg-white rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-semibold text-gray-800">{subject.subject}</span>
                                <span className="text-sm text-gray-600 ml-3">
                                  {new Date(subject.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-sm text-yellow-700 ml-2">({daysLeft}d)</span>
                              </div>
                              {subjectProg.total > 0 && (
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-green-500 h-2 rounded-full"
                                      style={{ width: `${subjectProg.percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold">{subjectProg.percentage}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* FUTURE EXAMS (> 21 days) */}
      {future.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-blue-600">Future Exams ({future.length})</h3>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="space-y-2">
              {future.map(exam => (
                <div key={exam.id} className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow transition-shadow">
                  <div className="flex-1">
                    <h5 className="font-bold text-gray-800">{exam.name}</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      {exam.daysUntil} days away • {exam.subjects.length} subject{exam.subjects.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingExam(exam.id)}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <Edit2 className="w-4 h-4 text-indigo-600" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${exam.name}"?`)) {
                          deleteExam(exam.id);
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
})()}

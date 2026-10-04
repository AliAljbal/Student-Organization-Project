import React, { useEffect, useState } from 'react';
import api from '../api/api';
import AdminLayout from '../layouts/AdminLayout'; // Adjust path if needed

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [yearTab, setYearTab] = useState('First Year');
  const [specTab, setSpecTab] = useState('IT');

  // Edit mode states
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editCourseData, setEditCourseData] = useState({
    name: '',
    academic_year: '',
    specialization: '',
    semester: 'Semester1',
  });

  const [newCourse, setNewCourse] = useState({
    name: '',
    academic_year: 'First Year',
    specialization: 'None',
    semester: 'Semester1',
  });

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('courses/', authHeaders);
      setCourses(res.data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`courses/${id}/`, authHeaders);
      fetchCourses();
    } catch {
      alert('❌ Failed to delete course.');
    }
  };

  const handleAdd = async () => {
    if (!newCourse.name.trim()) return alert("Course name is required");

    // Normalize specialization
    const normalizedSpecialization =
      ['Fourth Year', 'Fifth Year'].includes(newCourse.academic_year)
        ? newCourse.specialization
        : null;

    const dataToSend = { ...newCourse, specialization: normalizedSpecialization };

    try {
      await api.post('courses/', dataToSend, authHeaders);
      setNewCourse({ name: '', academic_year: 'First Year', specialization: 'None', semester: 'Semester1' });
      fetchCourses();
    } catch (err) {
      alert('❌ Failed to add course.');
    }
  };

  const startEdit = (course) => {
    setEditingCourseId(course.id);
    setEditCourseData({
      name: course.name,
      academic_year: course.academic_year,
      specialization: course.specialization || 'None',
      semester: course.semester || 'Semsester1',
    });
  };

  const saveEdit = async () => {
    if (!editCourseData.name.trim()) return alert('Course name is required');

    const normalizedSpecialization =
      ['Fourth Year', 'Fifth Year'].includes(editCourseData.academic_year)
        ? editCourseData.specialization
        : null;

    const dataToSend = { ...editCourseData, specialization: normalizedSpecialization };

    try {
      await api.put(`courses/${editingCourseId}/`, dataToSend, authHeaders);
      setCourses((prev) =>
        prev.map((course) =>
          course.id === editingCourseId ? { ...course, ...dataToSend } : course
        )
      );
      setEditingCourseId(null);
    } catch (err) {
      alert('❌ Failed to update course.');
    }
  };

  const cancelEdit = () => {
    setEditingCourseId(null);
  };

  const filteredCourses = courses.filter((course) => {
    const yearMatch = course.academic_year === yearTab;
    const specMatch =
      ['Fourth Year', 'Fifth Year'].includes(yearTab)
        ? course.specialization === specTab
        : true;
    return yearMatch && specMatch;
  });

  const academicYears = ['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Fifth Year'];
  const specializations = ['IT', 'CTE', 'CESE'];
  const semesters = ['Semester1', 'Semester2'];

  return (
    <AdminLayout>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Courses</h2>

        {/* Add course form */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Course Name"
            className="border p-2 rounded"
            value={newCourse.name}
            onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
          />

          <select
            className="border p-2 rounded"
            value={newCourse.academic_year}
            onChange={(e) => {
              const year = e.target.value;
              setNewCourse({
                ...newCourse,
                academic_year: year,
                specialization: ['Fourth Year', 'Fifth Year'].includes(year) ? 'IT' : 'None',
              });
            }}
          >
            {academicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {['Fourth Year', 'Fifth Year'].includes(newCourse.academic_year) && (
            <select
              className="border p-2 rounded"
              value={newCourse.specialization}
              onChange={(e) => setNewCourse({ ...newCourse, specialization: e.target.value })}
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          )}

          <select
            className="border p-2 rounded"
            value={newCourse.semester}
            onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
          >
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>

          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleAdd}>
            ➕ Add Course
          </button>
        </div>

        {/* Year Tabs */}
        <div className="mb-4 space-x-2">
          {academicYears.map((year) => (
            <button
              key={year}
              className={`px-3 py-1 rounded ${yearTab === year ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setYearTab(year)}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Specialization Tabs (for 4th and 5th year only) */}
        {['Fourth Year', 'Fifth Year'].includes(yearTab) && (
          <div className="mb-4 space-x-2">
            {specializations.map((spec) => (
              <button
                key={spec}
                className={`px-3 py-1 rounded ${specTab === spec ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setSpecTab(spec)}
              >
                {spec}
              </button>
            ))}
          </div>
        )}

        {/* Course List Table */}
        <table className="w-full bg-white shadow rounded">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Year</th>
              <th className="p-2 text-left">Specialization</th>
              <th className="p-2 text-left">Semester</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No courses found.
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr key={course.id} className="border-b">
                  {editingCourseId === course.id ? (
                    <>
                      <td className="p-2">
                        <input
                          type="text"
                          value={editCourseData.name}
                          onChange={(e) => setEditCourseData({ ...editCourseData, name: e.target.value })}
                          className="border p-1 rounded w-full"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={editCourseData.academic_year}
                          onChange={(e) =>
                            setEditCourseData({
                              ...editCourseData,
                              academic_year: e.target.value,
                              specialization: ['Fourth Year', 'Fifth Year'].includes(e.target.value) ? 'IT' : 'None',
                            })
                          }
                          className="border p-1 rounded w-full"
                        >
                          {academicYears.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        {['Fourth Year', 'Fifth Year'].includes(editCourseData.academic_year) ? (
                          <select
                            value={editCourseData.specialization}
                            onChange={(e) => setEditCourseData({ ...editCourseData, specialization: e.target.value })}
                            className="border p-1 rounded w-full"
                          >
                            {specializations.map((spec) => (
                              <option key={spec} value={spec}>
                                {spec}
                              </option>
                            ))}
                          </select>
                        ) : (
                          'None'
                        )}
                      </td>
                      <td className="p-2">
                        <select
                          value={editCourseData.semester}
                          onChange={(e) => setEditCourseData({ ...editCourseData, semester: e.target.value })}
                          className="border p-1 rounded w-full"
                        >
                          {semesters.map((sem) => (
                            <option key={sem} value={sem}>
                              {sem}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 space-x-2">
                        <button
                          className="bg-green-600 text-white px-2 py-1 rounded"
                          onClick={saveEdit}
                        >
                          Save
                        </button>
                        <button
                          className="bg-gray-400 text-white px-2 py-1 rounded"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2">{course.name}</td>
                      <td className="p-2">{course.academic_year}</td>
                      <td className="p-2">{course.specialization || 'None'}</td>
                      <td className="p-2">{course.semester || 'N/A'}</td>
                      <td className="p-2 space-x-2">
                        <button
                          className="bg-yellow-500 text-white px-2 py-1 rounded"
                          onClick={() => startEdit(course)}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default CourseList;

import React, { useEffect, useState, useRef } from 'react';
import './App.scss';
import clsx from 'clsx';
import { FaSortAmountDown } from 'react-icons/fa';
import { FaSortAmountUpAlt } from 'react-icons/fa';
import { BsFillTrashFill } from 'react-icons/bs';
import { FaFilter } from 'react-icons/fa';

const HOST = 'http://143.198.58.92:3001'
function App() {

  const [allSubredditsData, setAllSubredditsData] = useState(null);

  const [subreddits, setSubreddits] = useState(null);

  const GetSubredditsData = async () => {
    try {
      const response = await fetch(HOST + '/api/subs');
      const data = await response.json();
      console.log(data);

      setAllSubredditsData(data)
      setSubreddits(data);
    }
    catch (error) {
      console.log(error.message);
    }



  }
  useEffect(() => {
    GetSubredditsData();
  }, []);
  const [columnsNames, setColumnsNames] = useState(null);
  useEffect(() => {
    if (subreddits?.length) {
      const columnsNames = Object.keys(subreddits[0]);
      //put 'Subreddit Tags' as the second column
      columnsNames.splice(columnsNames.indexOf('Subreddit Tags'), 1);
      columnsNames.splice(1, 0, 'Subreddit Tags');
      setColumnsNames(columnsNames);

    }
  }, [subreddits])

  const [subredditsList, setSubredditsList] = useState(null);
  const GetSuberdditsList = async () => {
    try {
      const response = await fetch(HOST + '/api/list');
      const data = await response.json();
      console.log(data);

      setSubredditsList(data);
      return data
    }
    catch (error) {
      console.log(error.message);
    }

  }
  useEffect(() => {
    GetSuberdditsList();
  }, []);



  console.log({ subredditsList })
  useEffect(() => {
    if (!subredditsList?.length) return;
    console.log(subredditsList)

    //check which subreddits exist in subreddits data but not in subreddit list, it means they were deleted so remove them from subreddits data
    var deletedSubreddits = subreddits?.filter(subreddit => {
      return !subredditsList?.some(subredditList => subredditList?.subredditName == subreddit.Subreddit)
    })


    if (deletedSubreddits?.length) {
      deletedSubreddits.forEach(subreddit => {
        setSubreddits(subreddits => subreddits.filter(subredditData => subredditData.Subreddit != subreddit.Subreddit))
      }
      )
    }




  }, [subredditsList?.length])


  const CompareColumns = (a, b, column) => {
    if ((a[column] == 'BANNED') || (b[column] == 'BANNED')) return 1;
    if ((!a[column]) || (!b[column])) return 1;
    if (isNaN(a[column])) {
      if (a[column].includes('@')) {
        return b[column].split('@')[0] - (a[column].split('@')[0]);
      }

      else if (a[column].includes(':')) {
        return b[column].split(':')[0] - (a[column].split(':')[0]);
      }

      else {

        return String(b[column])?.localeCompare(String(a[column]));
      }
    }

    else {
      return b[column] - a[column];
    }
  }


  const [lastSortedColumn, setLastSortedColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);

  const SortByColumn = (column) => {
    //sort in ascending order (when column!=lastSortedColumn)
    //if same column is clicked twice, sort in descending order (when column==lastSortedColumn)
    //if subbreddit total subscribers is not a number, make it always the last row

    if (column != lastSortedColumn) {


      setSubreddits(subreddits.sort((a, b) => {

        return CompareColumns(a, b, column);

      }));

      setLastSortedColumn(column);
      setSortDirection('asc');
    }

    else {
      if (sortDirection == 'asc') {
        setSubreddits(subreddits.sort((a, b) => {

          return CompareColumns(b, a, column);

        }));

        setLastSortedColumn(column);
        setSortDirection('desc');
      }

      else {
        setSubreddits(subreddits.sort((a, b) => {

          return CompareColumns(a, b, column);

        }));

        setLastSortedColumn(column);
        setSortDirection('asc');
      }

    }
  }


  console.log({ sortDirection })
  console.log({ lastSortedColumn })


  const [newSubreddit, setNewSubreddit] = useState('')
  const [addingSubredditLoading, setAddingSubredditLoading] = useState(false);
  const [addingSubredditError, setAddingSubredditError] = useState('');

  const AddSubeddit = async () => {
    setAddingSubredditError('')

    if (newSubreddit == '') return setAddingSubredditError('Please enter a subreddit name')

    setAddingSubredditLoading(true);


    try {
      const response = await fetch(HOST + '/api/list/add/subreddit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subreddit: newSubreddit })
      });
      const data = await response.json();

      if (!data.error) {
        setNewSubreddit('');
        GetSuberdditsList();
        GetSubredditsData();


      } else {
        setAddingSubredditError(data.message);
      }


    }
    catch (error) {
      console.log(error.message);
      setAddingSubredditError(error.message);
    } finally {
      setAddingSubredditLoading(false);
    }
  }


  const [lastTimeUpdated, setLastTimeUpdated] = useState(null);

  const GetLastTimeUpdated = async () => {
    try {
      const response = await fetch(HOST + '/api/lastupdated');
      const data = await response.json();
      console.log(data);

      if (data.time) {
        const date = new Date(data.time);
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
        const newDate = date.toLocaleDateString('en-US', options);
        setLastTimeUpdated(newDate);
      }

    }
    catch (error) {
      console.log(error.message);
    }

  }
  useEffect(() => {
    GetLastTimeUpdated()
  }, [])

  const [selectedSubeddit, setSelectedSubreddit] = useState(null)
  const DeleteSubreddit = async () => {
    try {
      const response = await fetch(HOST + '/api/list/delete/subreddit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subreddit: selectedSubeddit?.['Subreddit'] })
      });
      const data = await response.json();
      console.log(data);


      //remove deleted subreddit from subreddits data
      const newSubreddits = subreddits.filter(subreddit => subreddit.Subreddit != selectedSubeddit?.['Subreddit']);
      setSubreddits(newSubreddits);



    }
    catch (error) {
      console.log(error.message);
    }
  }
  console.log({ subreddits })

  const [selectedTagSubreddit, setSelectedTagSubreddit] = useState(null);
  const [selectedTagText, setSelectedTagText] = useState(null);
  console.log({ selectedTagText, selectedTagSubreddit })

  const UpdateTag = async () => {
    try {
      const response = await fetch(HOST + '/api/list/update/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subreddit: selectedTagSubreddit, tags: selectedTagText })
      });
      const data = await response.json();
      console.log(data);

      await GetSubredditsData();
      setSelectedTagText(null);
      setSelectedTagSubreddit(null);

    }
    catch (error) {
      console.log(error.message);
    }
  }


  const [tagsSearch, setTagsSearch] = useState('');
  useEffect(() => {
    if (tagsSearch == '') {
      setSubreddits(allSubredditsData);
      return
    }
    const newSubreddits = subreddits.filter(subreddit => {
      if (subreddit['Subreddit Tags']) {
        return subreddit['Subreddit Tags'].toLowerCase().includes(tagsSearch.toLowerCase())
      }
    }
    )
    setSubreddits(newSubreddits);

  }, [tagsSearch])



  return (
    <div className="App">
      {lastTimeUpdated && <div className='text-xs text-gray-500 text-left mt-2 mx-4 pb-2 border-b border-gray-100' > Last updated on  {lastTimeUpdated}</div>}
      <div style={{ margin: '20px 10px -20px 10px', display: 'flex', alignItems: 'center', zIndex: '10', position: 'relative' }}>

        <input
          type="text"
          className=" form-control block px-3 py-1.5 text-sm font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          style={{ width: '200px' }}
          placeholder="Filter by tags"
          value={tagsSearch}
          onChange={(e) => setTagsSearch(e.target.value)}


        />
        {!tagsSearch && <FaFilter style={{ fontSize: '13px', opacity: '0.4', marginLeft: '-25px' }} />}

      </div>

      {(!subreddits?.length) && <div className="flex flex-col">
        <div class="flex animate-pulse">


          <div class="ml-4 mt-2 w-90" style={{ width: '98%', margin: 'auto', marginTop: '20px' }}>

            <ul class="mt-5 space-y-3">
              {[...Array(10).keys()].map((_, i) => (

                <li class="w-full  bg-gray-200 rounded-md dark:bg-gray-700" style={{ height: '70px' }}></li>
              ))}
            </ul>
          </div>
        </div>
      </div>}

      <div className="flex flex-col">
        <div className=" sm:-mx-6 lg:-mx-8">
          <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden">
              <table className="min-w-full table ">
                <thead className=" border-b">
                  <tr>
                    {subreddits && columnsNames?.map((column, key) => {
                      return (
                        <th scope="col" className={clsx("text-sm font-medium text-gray-900 px-6 py-4 cursor-pointer no-highlight ", (key == 0) ? 'text-left' : 'text-center')} style={{ maxWidth: '200px' }}
                          onClick={() => SortByColumn(column)}

                        >
                          <div style={{ display: 'flex', alignItems: 'center', marginRight: (column == lastSortedColumn) ? '' : '8px' }}> <div style={{ width: 'max-content' }} >{column}</div>
                            <div className='sort-icon' >{(column == lastSortedColumn) && (sortDirection == 'asc') && <FaSortAmountDown />
                              || (column == lastSortedColumn) && (sortDirection == 'desc') && <FaSortAmountUpAlt />}
                            </div> </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {subreddits && subreddits.map((subreddit) => {
                    if (isNaN(subreddit['Total Subscribers'])) return null

                    return (

                      <tr className={clsx("bg-white border-b  ease-in-out hover:bg-gray-100", isNaN(subreddit['Total Subscribers']) ? 'opacity-50	' : '')}>

                        {columnsNames?.map((column, key) => {
                          return (
                            <td className={clsx("text-sm text-gray-900  font-normal px-6 py-4 ", (key == 0) ? "text-left flex items-center fixed-row " : "text-center")}

                            >

                              <div> {key == 0 && <BsFillTrashFill className='text-red-400 text-sm mr-2 cursor-pointer' data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => { setSelectedSubreddit(subreddit) }} />}</div>

                              {column == 'Subreddit Tags' ? <div className='flex items-center w-max' >
                                <input
                                  type="text"
                                  className=" form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                  placeholder="Tags" defaultValue={subreddit[column]}
                                  onClick={() => {
                                    if (selectedTagSubreddit == subreddit['Subreddit']) return
                                    setSelectedTagText(subreddit[column])
                                    setSelectedTagSubreddit(subreddit['Subreddit'])
                                  }}
                                  onChange={(e) => {
                                    if ((selectedTagSubreddit == subreddit['Subreddit'])) {

                                      setSelectedTagText(e.target.value)
                                    }
                                  }}

                                />
                                {((selectedTagSubreddit == subreddit['Subreddit']) && (selectedTagText != subreddit[column])) && <button type="button"
                                  className={clsx("inline-block px-6 py-2.5 bg-green-600 ml-6 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-green-700 hover:shadow-lg focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green-800 active:shadow-lg transition duration-150 ease-in-out")}
                                  style={{ width: 'maxContent' }}
                                  onClick={() => UpdateTag()}

                                >Save</button>}
                              </div> : <div>{subreddit[column]}</div>}
                            </td>
                          )
                        })}
                      </tr>
                    )

                  }
                  )}
                  {subreddits && subreddits.map((subreddit) => {
                    if (isNaN(subreddit['Total Subscribers'])) return (
                      <tr className={clsx("bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100", (subreddit['Total Subscribers'] == 'BANNED') ? 'opacity-50	' : '')}>
                        {columnsNames?.map((value, key) => {
                          return (
                            <td className={clsx("text-sm text-gray-900  font-normal px-6 py-4 ", (key == 0) ? "text-left" : "text-center")} >
                              {subreddit[value]}
                            </td>
                          )
                        })}
                      </tr>
                    )

                  }
                  )}

                  <tr className={clsx("bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100")}>
                    <td className={clsx("text-sm text-gray-900  font-normal px-6 py-4 text-center flex absolute items-center")} >
                      <input
                        type="text"
                        className=" form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                        style={{ width: '200px' }}
                        placeholder="Suberddit Name"
                        value={newSubreddit}
                        onChange={(e) => setNewSubreddit(e.target.value)}
                      />
                      <button type="button"
                        className={clsx("inline-block px-6 py-2.5 bg-green-600 ml-6 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-green-700 hover:shadow-lg focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green-800 active:shadow-lg transition duration-150 ease-in-out")}
                        style={{ width: 'maxContent', opacity: addingSubredditLoading ? '0.5' : '1', pointerEvents: addingSubredditLoading ? 'none' : 'all' }}

                        onClick={AddSubeddit}
                      >Add subreddit</button>

                      <div className='text-red-500 text-xs ml-6' >{addingSubredditError}</div>

                    </td>

                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade fixed top-0 left-0 hidden w-full h-full outline-none overflow-x-hidden overflow-y-auto"
        id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog relative w-auto pointer-events-none">
          <div
            className="modal-content border-none shadow-lg relative flex flex-col w-full pointer-events-auto bg-white bg-clip-padding rounded-md outline-none text-current">
            <div
              className="modal-header flex flex-shrink-0 items-center justify-between p-4 border-b border-gray-200 rounded-t-md">
              <h5 className="text-xl font-medium leading-normal text-gray-800" id="exampleModalLabel">Delete subreddit</h5>
              <button type="button"
                className="btn-close box-content w-4 h-4 p-1 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline"
                data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body relative p-4">
              Do you want to delete {selectedSubeddit?.['Subreddit']} subreddit from list?
            </div>
            <div
              className="modal-footer flex flex-shrink-0 flex-wrap items-center justify-end p-4 border-t border-gray-200 rounded-b-md">
              <button type="button" className="px-6 py-2.5 bg-gray-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-gray-700 hover:shadow-lg focus:bg-gray-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-gray-800 active:shadow-lg transition duration-150 ease-in-out opacity-80" data-bs-dismiss="modal">Close</button>
              <button type="button" className="px-6 py-2.5 bg-red-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-red-700 hover:shadow-lg focus:bg-red-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-800 active:shadow-lg transition duration-150 ease-in-out ml-1 " data-bs-dismiss="modal"
                onClick={() => { DeleteSubreddit() }}
              >DELETE</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

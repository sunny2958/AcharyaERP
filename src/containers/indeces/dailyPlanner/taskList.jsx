import { useState, useEffect } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import GridIndex from "../../../components/GridIndex";
import { useNavigate } from "react-router-dom";
import axios from "../../../services/Api";
import moment from "moment";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import { Check, HighlightOff } from "@mui/icons-material";
import CustomModal from "../../../components/CustomModal";

const userID = JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.userId

const TaskList = () => {
    const [rows, setRows] = useState([]);
    const setCrumbs = useBreadcrumbs()
    const [modalContent, setModalContent] = useState({
        title: "",
        message: "",
        buttons: [],
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true)

    const columns = [
        {
            field: "empcode",
            headerName: "Emp Code",
            flex: 1,
            hide: true,
            valueGetter: (value, row) => row.empcode
        },
        {
            field: "type",
            headerName: "Type",
            flex: 1,
            valueGetter: (value, row) => row.type
        },
        {
            field: "task_title",
            headerName: "Title",
            flex: 1,
            valueGetter: (value, row) => row.task_title
        },
        {
            field: "task_type",
            headerName: "Task Type",
            flex: 1,
            valueGetter: (value, row) => row.task_type,
        },
        {
            field: "description",
            headerName: "Description",
            flex: 1,
            valueGetter: (value, row) => row.description
        },
        {
            field: "from_date",
            headerName: "From Date",
            flex: 1,
            valueGetter: (value, row) => `${row.from_date} ${moment(row.from_time, 'h:mm A').format('h:mm A')}`,
        },
        {
            field: "to_date",
            headerName: "To Date",
            flex: 1,
            valueGetter: (value, row) => `${row.to_date} ${moment(row.to_time, 'h:mm A').format('h:mm A')}`,
        },
        {
            field: "contribution_type",
            headerName: "Contribution Type",
            flex: 1,
            hide: true,
            valueGetter: (value, row) => row.contribution_type,
        },
        {
            field: "task_priority",
            headerName: "Priority",
            flex: 1,
            valueGetter: (value, row) => row.task_priority,
        },
        {
            field: "task_status",
            headerName: "Status",
            flex: 1,
            renderCell: params => [
                params.row.task_status === "Pending" ? (
                    <Button variant="text" sx={{ color: "red" }} onClick={() => handleStatus(params)}>{params.row.task_status}</Button>
                ) : (
                    <Typography sx={{ color: "green" }}>{params.row.task_status}</Typography>
                )
            ]
        },
        {
            field: "active",
            headerName: "Active",
            flex: 1,
            type: "actions",
            getActions: (params) => [
                params.row.active === true ? (
                    <IconButton
                        style={{ color: "green" }}
                        onClick={() => handleActive(params)}
                    >
                        <Check />
                    </IconButton>
                ) : (
                    <IconButton
                        style={{ color: "red" }}
                        onClick={() => handleActive(params)}
                    >
                        <HighlightOff />
                    </IconButton>
                ),
            ],
        }
    ]

    useEffect(() => {
        setCrumbs([
            { name: "Daily Planner" }
        ]);
        getData();
    }, []);

    const getData = async () => {
        const empId = await getEmpId()
        if (empId === null) return
        setLoading(true)
        await axios
            .get(`/api/fetchAllDailyPlannerBasedOnUser?page=0&page_size=1000&sort=created_date&userId=${userID}`)
            .then((res) => {
                setLoading(false)
                setRows(res.data.data.Paginated_data.content);
            })
            .catch((err) => {
                console.error(err)
                setLoading(false)
            });
    };

    const getEmpId = async () => {
        return new Promise(resolve => {
            setLoading(true)
            const userId = JSON.parse(sessionStorage.getItem("AcharyaErpUser"))?.userId;
            axios.get(`/api/employee/getEmployeeDetailsByUserID/${userId}`)
                .then((res) => {
                    setLoading(false)
                    if (res.data.data !== null) resolve(res.data.data.emp_id)
                    else resolve(null)
                })
                .catch((err) => {
                    setLoading(false)
                    console.error(err)
                    resolve(null)
                })
        })
    }

    const handleActive = async (params) => {
        const id = params.row.id;
        const handleToggle = async () => {
            setLoading(true)
            if (params.row.active === true) {
                await axios
                    .delete(`/api/deactiveDailyPlanner/${id}`)
                    .then((res) => {
                        setLoading(false)
                        if (res.status === 200) {
                            getData();
                        }
                    })
                    .catch((err) => {
                        console.error(err)
                        setLoading(false)
                    });
            } else if (params.row.active === false) {
                await axios
                    .delete(`/api/activateDailyPlanner/${id}`)
                    .then((res) => {
                        setLoading(false)
                        if (res.status === 200) {
                            getData();
                        }
                    })
                    .catch((err) => {
                        console.error(err)
                        setLoading(false)
                    });
            }
        };
        params.row.active === true
            ? setModalContent({
                title: "",
                message: "Do you want to make it Inactive ?",
                buttons: [
                    { name: "Yes", color: "primary", func: handleToggle },
                    { name: "No", color: "primary", func: () => { } },
                ],
            })
            : setModalContent({
                title: "",
                message: "Do you want to make it Active ?",
                buttons: [
                    { name: "Yes", color: "primary", func: handleToggle },
                    { name: "No", color: "primary", func: () => { } },
                ],
            });
        setModalOpen(true);
    }

    const handleStatus = (params) => {
        const handleToggle = async () => {
            setLoading(true)
            const { id, from_date, active, description, task_priority, to_date, task_title, to_time, from_time, emp_id, task_type, contribution_type, type } = params.row
            const body = {
                "daily_planner_id": id,
                "emp_id": emp_id,
                "task_title": task_title,
                "task_priority": task_priority,
                "description": description,
                "task_status": "Completed",
                "from_date": from_date,
                "to_date": to_date,
                "from_time": from_time,
                "to_time": to_time,
                "active": active,
                "type": type,
                "task_type": task_type,
                "contribution_type": contribution_type
            }
            await axios
                .put(`/api/updateDailyPlanner/${id}`, body)
                .then((res) => {
                    setLoading(false)
                    if (res.status === 200) {
                        getData();
                    }
                })
                .catch((err) => {
                    console.error(err)
                    setLoading(false)
                });
        }
        setModalContent({
            title: "",
            message: "Do you want to make it Complete?",
            buttons: [
                { name: "Yes", color: "primary", func: handleToggle },
                { name: "No", color: "primary", func: () => { } },
            ],
        })
        setModalOpen(true);
    }

    return (
        <Box sx={{ position: "relative" }}>
            <CustomModal
                open={modalOpen}
                setOpen={setModalOpen}
                title={modalContent.title}
                message={modalContent.message}
                buttons={modalContent.buttons}
            />

            <Box sx={{ display: "flex", justifyContent: "space-between", margin: "15px 0px" }}>
                <Box></Box>
                <Box>
                    <Button href="/daily-planner/create" variant="contained">Create</Button>
                </Box>
            </Box>
            <GridIndex rows={rows} columns={columns} />
        </Box>
    )
}
export default TaskList;

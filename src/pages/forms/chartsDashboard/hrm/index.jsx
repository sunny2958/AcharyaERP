import { useState, useEffect, lazy } from "react";
import { Grid, FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel, Stack, Typography, Box } from "@mui/material";
import useBreadcrumbs from "../../../../hooks/useBreadcrumbs";
import axios from "../../../../services/Api";
import { HorizontalBar, LineChart, StackedBar, VerticalBar } from "../Chart";
import styled from "@emotion/styled";
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CloseIcon from '@mui/icons-material/Close';
import { IOSSwitch } from "../IOSSwitch";
const GridIndex = lazy(() => import("../../../../components/GridIndex"));

const EnlargeChartIcon = styled(OpenInFullRoundedIcon)`
	position: absolute;
	right: 33px;
	top: 20px;
	color: #132353;
	cursor: pointer;

	@media screen and (max-width: 1024px){
		display: none;
	}
`

const CloseButton = styled(CloseIcon)`
	position: absolute;
	right: 33px;
	top: 20px;
	color: #132353;
	cursor: pointer;
`

const ChartSection = styled.div`
	visibility: 1;
	opacity: 1;
	position: fixed;
	top: 0;
	bottom: 0;
	right: 0;
	left: 0;
	background: rgba(0,0,0,0.7);
	backdrop-filter: blur(5px);
	transition: opacity 1s;
	z-index: 999;
`

const ChartContainer = styled.div`
	max-width: 85%;
	margin: 90px auto;
	border-radius: 5px;
	width: 100%;
	position: relative;
	transition: all 2s ease-in-out;
	padding: 30px;
	background-color: #ffffff;
`

const graphOptions = [
	{ value: "Department", label: "Department" },
	{ value: "Designation", label: "Designation" },
	{ value: "Gender", label: "Gender" },
	{ value: "Age Group", label: "Age Group" },
	{ value: "Join Data", label: "Join Data" },
	{ value: "Exit Data", label: "Exit Data" },
	{ value: "Marital Status", label: "Marital Status" },
	{ value: "Job Type", label: "Job Type" },
	{ value: "Shift", label: "Shift" },
	{ value: "Employment Type", label: "Employment Type" },
	{ value: "Join & Exit Data", label: "Join & Exit Data" },
]

const ChartOptions = [
	{ value: "verticalbar", label: "Vertical Bar" },
	{ value: "horizontalbar", label: "Horizontal Bar" },
	{ value: "stackedbarvertical", label: "Stacked Bar(Vertical)" },
	{ value: "stackedbarhorizontal", label: "Stacked Bar(Horizontal)" },
	{ value: "line", label: "Line" },
]

const ShortenMonths = [
	{ "January": "Jan" },
	{ "February": "Feb" },
	{ "March": "Mar" },
	{ "April": "Apr" },
	{ "May": "May" },
	{ "June": "Jun" },
	{ "July": "Jul" },
	{ "August": "Aug" },
	{ "September": "Sep" },
	{ "October": "Oct" },
	{ "November": "Nov" },
	{ "December": "Dec" }
]

const DEFAULT_GRAPH = "Employment Type"
const DEFAULT_CHART = "horizontalbar"

const ChartsTest = () => {
	const setCrumbs = useBreadcrumbs()
	const [selectedGraph, setSelectedGraph] = useState(DEFAULT_GRAPH)
	const [selectedChart, setSelectedChart] = useState(DEFAULT_CHART)
	const [selectedSchools, setSelectedSchools] = useState([])
	const [data, setData] = useState([]);
	const [year, setYear] = useState(2024)
	const [yearOptions, setYearOptions] = useState([])
	const [tableRows, setTableRows] = useState([])
	const [tableColumns, setTableColumns] = useState([])
	const [chartData, setChartData] = useState({})
	const [schoolColorsArray, setSchoolColorsArray] = useState([])
	const [selectedParam, setSelectedParam] = useState("")
	const [paramList, setParamList] = useState([])
	const [enlargeChart, setEnlargeChart] = useState(false)
	const [isTableView, setIsTableView] = useState(true)

	useEffect(() => {
		getSchoolColors()
		setCrumbs([
			{ name: "HRM" }
		])
		let lastTenYears = []
		const currentYear = new Date().getFullYear();
		for (let year = currentYear - 10; year <= currentYear; year++) lastTenYears.push(year)
		setYearOptions(lastTenYears)
		setYear(lastTenYears[lastTenYears.length - 1])
	}, [])

	useEffect(() => {
		if (selectedGraph === "Department") handleApiCall("/api/employee/getEmployeeDetailsForReportOnDepartment")
		else if (selectedGraph === "Designation") handleApiCall("/api/employee/getEmployeeDetailsForReportOnDesignation")
		else if (selectedGraph === "Gender") handleApiCall("/api/employee/getEmployeeDetailsForReportOnGender")
		else if (selectedGraph === "Age Group") handleApiCall("/api/employee/getEmployeeDetailsForReportOnDateOfBirth")
		else if (selectedGraph === "Join Data") handleApiCall(`/api/employee/getEmployeeDetailsForReportOnMonthWiseOfJoiningYear/${year}`)
		else if (selectedGraph === "Exit Data") handleApiCall(`/api/employee/getEmployeeRelievingReportDataOnMonthWise/${year}`)
		else if (selectedGraph === "Schools") handleApiCall("/api/employee/getEmployeeDetailsForReportOnSchools")
		else if (selectedGraph === "ExperienceInMonth") handleApiCall("/api/employee/getEmployeeDetailsForReportOnExperienceInMonth")
		else if (selectedGraph === "ExperienceInYear") handleApiCall("/api/employee/getEmployeeDetailsForReportOnExperienceInYear")
		else if (selectedGraph === "Marital Status") handleApiCall("/api/employee/getEmployeeDetailsForReportOnMaritalStatus")
		else if (selectedGraph === "Job Type") handleApiCall("/api/employee/getEmployeeDetailsForReportOnJobType")
		else if (selectedGraph === "Shift") handleApiCall("/api/employee/getEmployeeDetailsForReportOnShift")
		else if (selectedGraph === "Employment Type") handleApiCall("/api/employee/getEmployeeDetailsForReportOnEmployeeType")
		else if (selectedGraph === "Join & Exit Data") handleApiCall(`/api/employee/getEmployeeDetailsForReportOnMonthWiseOfJoiningDateAndRelievingData/${year}`)
	}, [selectedGraph, year])

	useEffect(() => {
		if (selectedSchools.length <= 0) return

		if (selectedGraph !== "Join & Exit Data") {
			if (selectedParam === "All") {
				updateTable(data)
				updateChart(data)
			} else handleOnParamChange()
		} else {
			if (selectedParam === "All") {
				updateJoinAndExitChart_(data)
				updateJoinAndExitTable_(data)
			} else handleOnParamChange()
		}
	}, [selectedSchools, selectedParam])

	const handleOnParamChange = () => {
		const selectedParamData = []
		if (selectedGraph === "Join & Exit Data") {
			const relieve = data.relieving_date_data.filter(obj => obj.school_name_short === selectedParam)
			const join = data.joining_date_data.filter(obj => obj.school_name_short === selectedParam)
			updateJoinAndExitChart_({relieving_date_data: relieve, joining_date_data: join})
			updateJoinAndExitTable_({relieving_date_data: relieve, joining_date_data: join})
		} else {
			const duplicateData = [...data]
			for (const obj of duplicateData) {
				const keys = Object.keys(obj)
				let newObj = {}
				keys.forEach(key => {
					if (key === "school_name_short" || key === selectedParam || key === "school_param") {
						newObj[key] = obj[key]
					}
				})
				selectedParamData.push(newObj)
			}
			updateTable(selectedParamData)
			updateChart(selectedParamData)
		}
	}

	const getSchoolColors = async () => {
		await axios.get(`/api/institute/fetchAllSchoolDetail?page=${0}&page_size=${10000}&sort=created_date`)
			.then((Response) => {
				const response = Response.data.data
				const schoolColorsArray = response.map(obj => {
					let borderColor = ''
					let backgroundColor = ''
					const { school_color, school_name_short } = obj
					if (school_color === '' || school_color === undefined || school_color === null) {
						const { r, g, b } = random_rgb()
						borderColor = `rgb(${r}, ${g}, ${b})`
						backgroundColor = `rgb(${r}, ${g}, ${b}, 0.5)`
					} else {
						borderColor = school_color
						backgroundColor = `${school_color}80`
					}

					return { borderColor, backgroundColor, schoolName: school_name_short }
				})

				setSchoolColorsArray(schoolColorsArray)
			})
			.catch((err) => console.error(err));
	}

	const handleApiCall = async api => {
		await axios.get(api)
			.then(async (res) => {
				const response = res.data.data
				if (response.length <= 0) return alert("No Data found")
				let modifiedResponse = response
				if (selectedGraph === "Join Data" || selectedGraph === "Exit Data") {
					modifiedResponse = await trimMonthTo3Letters(response)
					updateApiResponse(modifiedResponse)
				} else if (selectedGraph === "Join & Exit Data") {
					const trimmedJoin = await trimMonthTo3Letters([...response.joining_date_data])
					const joinData = trimmedJoin.map(obj => { return { ...obj, "school_param": `${obj.school_name_short}(Join)` } })
					const trimmedExit = await trimMonthTo3Letters([...response.relieving_date_data])
					const exitData = trimmedExit.map(obj => { return { ...obj, "school_param": `${obj.school_name_short}(Exit)` } })
					const combinedArray = [...joinData, ...exitData]
					const params = [{ value: "All", label: "All" }]
					for (const obj of combinedArray) {
						params.push({ label: obj["school_name_short"], value: obj["school_name_short"] })
					}
					const unique = [...new Map(params.map(item => [item["value"], item])).values()]
					setParamList(unique)
					setSelectedParam("All")
					setData(response)
					const groupedSchool = groupBy([...joinData, ...exitData], 'school_name_short')
					const schoolNames = Object.keys(groupedSchool)
					const schoolList = schoolNames.map(value => {
						return { value: value, label: value }
					})
					setSelectedSchools(schoolList.map(obj => obj.value))
				} else updateApiResponse(modifiedResponse)
			})
			.catch((err) => console.error(err))
	}

	const updateApiResponse = (modifiedResponse,) => {
		updateParamList(modifiedResponse)
		setData(modifiedResponse)
		const schoolList = modifiedResponse.map(obj => {
			return { value: obj.school_name_short, label: obj.school_name_short }
		})

		setSelectedSchools(schoolList.map(obj => obj.value))
	}

	const groupBy = (arr, property) => {
		return arr.reduce(function (memo, x) {
			if (!memo[x[property]]) { memo[x[property]] = []; }
			memo[x[property]].push(x);
			return memo;
		}, {});
	};

	const trimMonthTo3Letters = (response) => {
		return new Promise(resolve => {
			const modifiedResponse = []
			for (const obj of response) {
				const keys = Object.keys(obj)
				let newObj = {}
				keys.forEach(key => {
					if (key === "school_name_short") newObj[key] = obj[key]
					else {
						const newKeyObj = ShortenMonths.find(monthObj => monthObj[key])
						const newKey = newKeyObj[key]
						newObj[newKey] = obj[key]
					}
				})
				modifiedResponse.push(newObj)
			}
			resolve(modifiedResponse)
		})
	}

	const updateParamList = response => {
		const params = []
		for (const obj of response) {
			const keys = Object.keys(obj)
			params.push(keys)
		}
		const uniqueParams = [...new Set(params.flat())]
		const list = [{ value: "All", label: "All" }]
		for (const value of uniqueParams) {
			if (value !== "school_name_short" && value !== "school_param") {
				list.push({ value, label: value })
			}
		}
		setParamList(list)
		setSelectedParam("All")
	}

	const updateTable = (dataArray) => {
		let schoolsList = [...new Set(selectedSchools)]
		const rowsToShow = []
		const sortedData = dataArray.sort(function (a, b) {
			return Object.keys(b).length - Object.keys(a).length;
		})
		let keysList = []
		for (const obj of sortedData) {
			let newObj = {}
			if (schoolsList.includes(obj.school_name_short)) {
				newObj["school_name_short"] = obj.school_name_short
				// Add total to each row
				let total = 0
				const keys = Object.keys(obj).filter(key => {
					if (key === "org_type" || key === "org_name") return false
					return key
				})

				keys.splice(keys.indexOf("school_name_short"), 1)
				keysList.push(...keys, "Total")
				keys.forEach(key => { total += obj[key] })
				rowsToShow.push({ ...obj, "Total": total })
			}
		}

		let uniqueKeys = [...new Set(keysList)]
		const monthSortAppliedFor = ["Join Data", "Exit Data"]
		if (monthSortAppliedFor.includes(selectedGraph)) {
			uniqueKeys = sortByMonth([...new Set(keysList)])
		} else if (selectedGraph === "Age Group") {
			uniqueKeys = sortAgeGroup([...new Set(keysList)])
		}
		uniqueKeys.splice(uniqueKeys.indexOf("Total"), 1)
		uniqueKeys = [...uniqueKeys, "Total"]

		const finalRowsToShow = []
		for (const [index, key] of uniqueKeys.entries()) {
			let newObj = { id: index }
			newObj[selectedGraph] = key
			let total = 0
			schoolsList.forEach(school => {
				const row = rowsToShow.find(obj => obj.school_name_short === school)
				newObj[school] = row[key] ? row[key] : 0
				total += (row[key] ? row[key] : 0)
			})
			newObj["Total"] = total

			finalRowsToShow.push(newObj)
		}

		let columns = [{ field: selectedGraph, headerName: selectedGraph, flex: 1, minWidth: 180, headerClassName: "header-bg" }]
		for (const key of schoolsList)
			columns.push({ field: key, headerName: key, type: 'number', flex: 1, headerClassName: "header-bg" })

		columns.push({ field: "Total", headerName: "Total", type: 'number', flex: 1, headerClassName: "header-bg", cellClassName: "last-column" })

		setTableColumns(columns)
		setTableRows(finalRowsToShow);
	}

	const updateChart = (dataArray) => {
		const getValues = (row, columnNames) => {
			const values = columnNames.map(key => row[key] ? row[key] : 0)
			return values
		}

		const rowsToShow = dataArray.filter(obj => selectedSchools.includes(obj.school_name_short))
		let columnNames = [];
		for (const obj of rowsToShow)
			columnNames.push(...Object.keys(obj))

		columnNames = [...new Set(columnNames)];
		columnNames.splice(columnNames.indexOf("school_name_short"), 1);

		const monthSortAppliedFor = ["Join Data", "Exit Data"]
		if (monthSortAppliedFor.includes(selectedGraph)) {
			columnNames = sortByMonth(columnNames)
		} else if (selectedGraph === "Age Group") {
			columnNames = sortAgeGroup(columnNames)
		}
		const datasets = rowsToShow.map((row, i) => {
			const schoolColorObj = schoolColorsArray.find(obj => obj.schoolName === row.school_name_short)
			const { r, g, b } = random_rgb()
			return {
				id: i + 1,
				label: row.school_name_short,
				data: getValues(row, columnNames),
				borderColor: schoolColorObj ? schoolColorObj.borderColor : `rgb(${r}, ${g}, ${b})`,
				backgroundColor: schoolColorObj ? schoolColorObj.backgroundColor : `rgb(${r}, ${g}, ${b}, 0.5)`
			}
		})
		const finalData = { labels: columnNames, datasets }
		setChartData(finalData)
	}

	const sortByMonth = (arr) => {
		const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Total"]
		arr.sort(function (a, b) {
			return months.indexOf(a) - months.indexOf(b)
		})
		return arr
	}

	const sortAgeGroup = (arr) => {
		const months = ["0 - 10", "10 - 20", "11 - 20", "20 - 30", "21 - 30", "30 - 40", "31 - 40",
			"40 - 50", "41 - 50", "50 - 60", "51 - 60", "60 - 70", "61 - 70", "70 - 80", "71 - 80",
			"80 - 90", "81 - 90", "Total"]
		arr.sort(function (a, b) {
			return months.indexOf(a) - months.indexOf(b)
		})
		return arr
	}

	const updateJoinAndExitTable_ = async (dataArray) => {
		const getSubtotal = (arr, label) => {
			let obj = {}
			let total = 0
			arr.forEach(element => {
				const keys = Object.keys(element).filter(key => key !== "school_name_short")
				keys.forEach(key => {
					obj[key] ? obj[key] = obj[key] + element[key] : obj[key] = element[key]
					total += element[key]
				})
			});
			obj["Type"] = label
			obj["Total"] = total

			return obj
		}

		const { joining_date_data, relieving_date_data } = dataArray
		const trimmedJoin = await trimMonthTo3Letters(joining_date_data)
		const trimmedExit = await trimMonthTo3Letters(relieving_date_data)
		let joinObj = getSubtotal(trimmedJoin, "Join")
		let exitObj = getSubtotal(trimmedExit, "Exit")
		let grandTotal = getSubtotal([joinObj, exitObj], "Total")
		grandTotal["Total"] = joinObj["Total"] + exitObj["Total"]

		let columnNames = [...new Set([...Object.keys(joinObj)], [...Object.keys(exitObj)])]
		columnNames.splice(columnNames.indexOf("Type"), 1)
		columnNames = sortByMonth(columnNames)

		let columns = [{ field: "Type", headerName: "Type", flex: 1, headerClassName: "header-bg" }]
		for (const key of columnNames)
			columns.push({ field: key, headerName: key, flex: 1, type: 'number', headerClassName: "header-bg" })

		setTableColumns(columns)
		setTableRows([joinObj, exitObj, grandTotal]);
	}

	const updateJoinAndExitChart_ = async (dataArray) => {
		const getSubtotal = (arr, label) => {
			let obj = {}
			arr.forEach(element => {
				const keys = Object.keys(element).filter(key => key !== "school_name_short")
				keys.forEach(key => {
					obj[key] ? obj[key] = obj[key] + element[key] : obj[key] = element[key]
				})
			});
			obj["label"] = label

			return obj
		}

		const getValues = (row, columnNames) => {
			const values = columnNames.map(key => row[key] ? row[key] : 0)
			return values
		}

		const { joining_date_data, relieving_date_data } = dataArray
		const trimmedJoin = await trimMonthTo3Letters(joining_date_data)
		const trimmedExit = await trimMonthTo3Letters(relieving_date_data)
		let joinObj = getSubtotal(trimmedJoin, "Join")
		let exitObj = getSubtotal(trimmedExit, "Exit")

		const colors = ["118, 185, 0", "232, 63, 51"]
		let columnNames = [...new Set([...Object.keys(joinObj)], [...Object.keys(exitObj)])]
		columnNames.splice(columnNames.indexOf("label"), 1)
		columnNames = sortByMonth(columnNames)

		const datasets = [joinObj, exitObj].map((row, i) => {
			return {
				id: i + 1,
				label: row.label,
				data: getValues(row, columnNames),
				borderColor: `rgb(${colors[i]})`,
				backgroundColor: `rgb(${colors[i]}, 0.5)`,
				fill: true,
				lineTension: 0.3
			}
		})
		const finalData = { labels: columnNames, datasets }
		setChartData(finalData)
		setSelectedChart("line")
	}

	const random_rgb = () => {
		let o = Math.round, r = Math.random, s = 255;
		return { r: o(r() * s), g: o(r() * s), b: o(r() * s) }
	}

	const renderChart = () => {
		switch (selectedChart) {
			case 'verticalbar':
				return <VerticalBar data={chartData} title={selectedGraph} showDataLabel={false} />
			case 'horizontalbar':
				return <HorizontalBar data={chartData} title={selectedGraph} showDataLabel={false} />
			case 'line':
				return <LineChart data={chartData} title={selectedGraph} showDataLabel={(selectedGraph === "Join & Exit Data") ? true : false} />
			case 'stackedbarvertical':
				return <StackedBar data={chartData} title={selectedGraph} vertical={true} showDataLabel={false} />
			case 'stackedbarhorizontal':
				return <StackedBar data={chartData} title={selectedGraph} vertical={false} showDataLabel={false} />
			default:
				return null
		}
	}

	return (<>
		<Grid container alignItems="center" justifyContent="space-between" pt={3} rowGap={4}>
			{enlargeChart && <ChartSection>
				<ChartContainer>
					<Grid item xs={12} sm={12} md={12} lg={12} xl={12} p={2}>
						<CloseButton fontSize="large" onClick={() => setEnlargeChart(false)} />
						{renderChart()}
					</Grid>
				</ChartContainer>
			</ChartSection>
			}
			<Grid container spacing={2} sx={{ zIndex: 3 }}>
				<Grid item xs={12} sm={6} md={6} sx={{ zIndex: 3 }}>
					<Grid container columnGap={1} alignItems="center" justifyContent="center" >
						<Grid item flex={1}>
							<FormControl size="medium" fullWidth>
								<InputLabel>Graph</InputLabel>
								<Select size="medium" name="graph" value={selectedGraph} label="Graph"
									onChange={(e) => setSelectedGraph(e.target.value)}>
									{graphOptions.map((obj, index) => (
										<MenuItem key={index} value={obj.value}>
											{obj.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						{(selectedGraph === "Join Data" || selectedGraph === "Exit Data" || selectedGraph === "Join & Exit Data") && (
							<Grid item xs={4} sx={{ zIndex: 3 }}>
								<FormControl size="medium" fullWidth>
									<InputLabel>Year</InputLabel>
									<Select size="medium" name="year" value={year} label="Year"
										onChange={(e) => setYear(e.target.value)}>
										{yearOptions.map((year, index) => (
											<MenuItem key={index} value={year}>
												{year}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
						)}
					</Grid>
				</Grid>
				<Grid item xs={12} sm={6} md={6} sx={{ zIndex: 3 }}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
							<FormControl size="medium" fullWidth>
								<InputLabel>Chart</InputLabel>
								<Select size="medium" name="chart" value={selectedChart} label="Chart"
									onChange={(e) => setSelectedChart(e.target.value)}>
									{ChartOptions.map((obj, index) => (
										<MenuItem key={index} value={obj.value}>
											{obj.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
							<FormControl size="medium" fullWidth>
								<InputLabel>Parameters</InputLabel>
								<Select size="medium" name="parameters" value={selectedParam} label="Parameters"
									onChange={(e) => setSelectedParam(e.target.value)}>
									{paramList.map((obj, index) => (
										<MenuItem key={index} value={obj.value}>
											{obj.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
					</Grid>
				</Grid>
			</Grid>

			<Grid container spacing={2}>
				<Grid item xs={12} >
					<FormGroup>
						<Box sx={{ display: "flex", gap: "40px" }}>
							<Stack direction="row" spacing={1} alignItems="center">
								<Typography>Chart view</Typography>
								<FormControlLabel
									control={<IOSSwitch sx={{ m: 1 }} ischecked={isTableView} handlechange={() => setIsTableView(!isTableView)} />}
								/>
								<Typography>Table view</Typography>
							</Stack>
						</Box>
					</FormGroup>
					{isTableView ?
						<Grid item xs={12} md={12} lg={12} pt={1} sx={{
							'& .last-row': { fontWeight: "bold", backgroundColor: "#376a7d !important", color: "#fff" },
							'& .last-column': { fontWeight: "bold" },
							'& .last-row:hover': { backgroundColor: "#376a7d !important", color: "#fff" },
							'& .header-bg': { fontWeight: "bold", backgroundColor: "#376a7d", color: "#fff" },
						}}>
							{selectedGraph === "Join & Exit Data" ?
								<GridIndex rows={tableRows} columns={tableColumns} getRowId={row => row.Type}
									isRowSelectable={(params) => params.row.Type !== "Total"}
									getRowClassName={(params) => {
										return params.row.Type === "Total" ? "last-row" : ""
									}} />
								: <GridIndex rows={tableRows} columns={tableColumns} getRowId={row => row.id}
									isRowSelectable={(params) => tableRows.length - 1 !== params.row.id}
									getRowClassName={(params) => {
										return tableRows.length - 1 === params.row.id ? "last-row" : ""
									}} />}
						</Grid>
						:
						<Grid item xs={12} md={12} lg={12} p={3} style={{ position: "relative" }}>
							{Object.keys(chartData).length > 0 && <EnlargeChartIcon fontSize="medium" onClick={() => setEnlargeChart(!enlargeChart)} />}
							{Object.keys(chartData).length > 0 ? renderChart() : null}
						</Grid>
					}
				</Grid>
			</Grid>
		</Grid>
	</>)
}

export default ChartsTest